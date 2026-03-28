import { JobStatus } from '../enums/job-status.enum';

export class UpdateJobStatusDto {
  status: JobStatus;
  failureReason?: string;
}