import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Job } from './entities/job.entity';
import { JobStatus } from './enums/job-status.enum';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dtos/create-job.dto';
import { JobType } from './enums/job-type.enum';
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async createJob(@Body() dto: CreateJobDto): Promise<Job> {
    return this.jobsService.createJob(dto);
  }

  @Get(':id')
  async getJobById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Job | null> {
    return this.jobsService.getJobById(id);
  }

  @Get()
  async listJobs(
    @Query('status') status?: JobStatus,
    @Query('type') type?: JobType,
  ): Promise<Job[]> {
    return this.jobsService.listJobs({ status, type });
  }
}