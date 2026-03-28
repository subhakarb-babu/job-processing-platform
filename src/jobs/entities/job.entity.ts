import { JobStatus } from '../enums/job-status.enum';
import { JobType } from '../enums/job-type.enum';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('jobs')
@Index('idx_jobs_status_type', ['status', 'type'])
@Index('idx_jobs_status_next_run', ['status', 'nextRunAt'])
export class Job{

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: JobType,
  })
  type: JobType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ default: 0 })
  priority: number;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRunAt: Date | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  idempotencyKey?: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt!: Date; 
  
  @UpdateDateColumn()
  updatedAt!: Date; 
}