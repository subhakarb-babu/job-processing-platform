import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Job } from "./job.entity";
import { JobStatus } from '../enums/job-status.enum';

@Entity('job_attempts')
@Index(['jobId', 'attemptNumber'])
export class JobAttempt{

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  attemptNumber: number;

  @Column({
    type: 'enum',
    enum: JobStatus,
  })
  status: JobStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'int', nullable: true })
  responseCode?: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date; 
  
  @UpdateDateColumn()
  updatedAt: Date; 
}