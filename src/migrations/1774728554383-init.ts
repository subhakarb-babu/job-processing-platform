import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1774728554383 implements MigrationInterface {
    name = 'Init1774728554383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."jobs_type_enum" AS ENUM('GENERATE_REPORT', 'PROCESS_FILE', 'DELIVER_WEBHOOK', 'SEND_NOTIFICATION', 'USER_ONBOARDING_WORKFLOW')`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_status_enum" AS ENUM('PENDING', 'QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING', 'DEAD')`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."jobs_type_enum" NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'PENDING', "payload" jsonb NOT NULL, "priority" integer NOT NULL DEFAULT '0', "maxRetries" integer NOT NULL DEFAULT '3', "retryCount" integer NOT NULL DEFAULT '0', "nextRunAt" TIMESTAMP, "idempotencyKey" character varying, "startedAt" TIMESTAMP, "completedAt" TIMESTAMP, "failedAt" TIMESTAMP, "failureReason" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e7bffc12dbf947ffa4b453eb60c" UNIQUE ("idempotencyKey"), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_jobs_status_next_run" ON "jobs" ("status", "nextRunAt") `);
        await queryRunner.query(`CREATE INDEX "idx_jobs_status_type" ON "jobs" ("status", "type") `);
        await queryRunner.query(`CREATE TYPE "public"."job_attempts_status_enum" AS ENUM('PENDING', 'QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING', 'DEAD')`);
        await queryRunner.query(`CREATE TABLE "job_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "jobId" uuid NOT NULL, "attemptNumber" integer NOT NULL, "status" "public"."job_attempts_status_enum" NOT NULL, "errorMessage" text, "responseCode" integer, "startedAt" TIMESTAMP, "finishedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_61deab46f06c9ab9d5585b28423" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dbf1bbe4e8b16c8e1b8680a541" ON "job_attempts" ("jobId", "attemptNumber") `);
        await queryRunner.query(`CREATE TABLE "webhook_deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "jobId" uuid NOT NULL, "url" text NOT NULL, "method" character varying NOT NULL, "headers" jsonb, "requestBody" jsonb, "lastResponseBody" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_535dd409947fb6d8fc6dfc0112a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "job_attempts" ADD CONSTRAINT "FK_8c1759b899ebddee08db795a37b" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "FK_6cdd1ab34deff4c5258f277c36a" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_deliveries" DROP CONSTRAINT "FK_6cdd1ab34deff4c5258f277c36a"`);
        await queryRunner.query(`ALTER TABLE "job_attempts" DROP CONSTRAINT "FK_8c1759b899ebddee08db795a37b"`);
        await queryRunner.query(`DROP TABLE "webhook_deliveries"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dbf1bbe4e8b16c8e1b8680a541"`);
        await queryRunner.query(`DROP TABLE "job_attempts"`);
        await queryRunner.query(`DROP TYPE "public"."job_attempts_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_jobs_status_type"`);
        await queryRunner.query(`DROP INDEX "public"."idx_jobs_status_next_run"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_type_enum"`);
    }

}
