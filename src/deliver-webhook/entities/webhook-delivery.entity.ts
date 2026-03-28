import { Job } from '../../jobs/entities/job.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('webhook_deliveries')
export class WebhookDelivery{

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar' })
  method: string;

  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  requestBody?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  lastResponseBody?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date; 

  @UpdateDateColumn()
  updatedAt: Date; 
}