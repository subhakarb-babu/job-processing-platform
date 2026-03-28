import { JobType } from '../enums/job-type.enum';

export class CreateJobDto {
  type: JobType;

  payload: Record<string, any>;

  priority?: number;

  maxRetries?: number;

  idempotencyKey?: string;

  scheduledAt?: Date;
}