import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobStatus } from './enums/job-status.enum';
import { JobAttempt } from './entities/job-attempt.entity';
import { CreateJobDto } from './dtos/create-job.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JobsService {
  private static readonly BASE_RETRY_DELAY_MS = 5000;
  private static readonly MAX_RETRY_DELAY_MS = 5 * 60 * 1000;

  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(JobAttempt)
    private readonly attemptRepository: Repository<JobAttempt>,
  ) {}

  async createJob(dto: CreateJobDto): Promise<Job> {
    if (dto.idempotencyKey) {
      const existing = await this.jobRepository.findOneBy({
        idempotencyKey: dto.idempotencyKey,
      });

      if (existing) return existing;
    }

    const job = this.jobRepository.create({
      ...dto,
      status: JobStatus.PENDING,
      retryCount: 0,
      nextRunAt: dto.scheduledAt ?? null,
    });

    try {
      return await this.jobRepository.save(job);
    } catch (error) {
      if (dto.idempotencyKey && this.isUniqueConstraintError(error)) {
        const existing = await this.jobRepository.findOneBy({
          idempotencyKey: dto.idempotencyKey,
        });

        if (existing) return existing;

        throw new ConflictException(
          'A job with this idempotency key already exists',
        );
      }

      this.logger.error(
        'Failed to persist job',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Failed to create job');
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    return this.jobRepository.findOneBy({ id });
  }

  async listJobs(filters: {
    status?: JobStatus;
    type?: Job['type'];
  }): Promise<Job[]> {
    return this.jobRepository.find({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markJobRunning(jobId: string): Promise<void> {
    const result = await this.jobRepository.update(jobId, {
      status: JobStatus.RUNNING,
      startedAt: new Date(),
      completedAt: null,
    });

    this.ensureUpdated(result.affected, 'Job not found');
  }

  async markJobSuccess(jobId: string): Promise<void> {
    const result = await this.jobRepository.update(jobId, {
      status: JobStatus.SUCCESS,
      completedAt: new Date(),
    });

    this.ensureUpdated(result.affected, 'Job not found');
  }

  async markJobFailed(jobId: string, error: string): Promise<void> {
    const job = await this.jobRepository.findOneBy({ id: jobId });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (
      job.status === JobStatus.SUCCESS ||
      job.status === JobStatus.FAILED ||
      job.status === JobStatus.DEAD
    ) {
      throw new BadRequestException(
        `Cannot mark failed from terminal status ${job.status}`,
      );
    }

    const retryCount = job.retryCount + 1;
    const shouldRetry = retryCount < job.maxRetries;

    const nextRunAt = shouldRetry
      ? this.calculateNextRunAt(retryCount)
      : null;

    const result = await this.jobRepository.update(jobId, {
      status: shouldRetry ? JobStatus.RETRYING : JobStatus.FAILED,
      retryCount,
      failedAt: new Date(),
      failureReason: error,
      nextRunAt,
      completedAt: shouldRetry ? null : new Date(),
    });

    this.ensureUpdated(result.affected, 'Job not found');
  }

  async createAttempt(
    jobId: string,
    attemptNumber: number,
  ): Promise<JobAttempt> {
    if (attemptNumber <= 0) {
      throw new BadRequestException('attemptNumber must be greater than 0');
    }

    const attempt = this.attemptRepository.create({
      jobId,
      attemptNumber,
      status: JobStatus.RUNNING,
      startedAt: new Date(),
    });

    return this.attemptRepository.save(attempt);
  }

  async completeAttempt(
    attemptId: string,
    status: JobStatus,
    error?: string,
  ): Promise<void> {
    if (status === JobStatus.RUNNING || status === JobStatus.QUEUED) {
      throw new BadRequestException(
        'Attempt cannot be completed with a non-terminal status',
      );
    }

    const result = await this.attemptRepository.update(attemptId, {
      status,
      errorMessage: error,
      finishedAt: new Date(),
    });

    this.ensureUpdated(result.affected, 'Attempt not found');
  }


  private ensureUpdated(
    affected: number | null | undefined,
    message: string,
  ): void {
    if (!affected) {
      throw new NotFoundException(message);
    }
  }

  //retry duration = baseDelay * 2^(retryCount - 1)
  //baseDelay = 5 seconds, maxDelay = 5 minutes
  private calculateNextRunAt(retryCount: number): Date {
    const delay = Math.min(
      Math.pow(2, retryCount) * JobsService.BASE_RETRY_DELAY_MS,
      JobsService.MAX_RETRY_DELAY_MS,
    );

    return new Date(Date.now() + delay);
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;

    const driverError = (error as QueryFailedError & {
      driverError?: { code?: string };
    }).driverError;

    return driverError?.code === '23505';
  }
}