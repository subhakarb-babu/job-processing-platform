import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobAttempt } from './entities/job-attempt.entity';
import { JobsService } from './jobs.service';


@Module({
  imports: [TypeOrmModule.forFeature([Job, JobAttempt])],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}