import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "subscribers_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "subscribers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletter_deliveries" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "subscribers_interests" CASCADE;
  DROP TABLE "subscribers" CASCADE;
  DROP TABLE "newsletter_deliveries" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_subscribers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_newsletter_deliveries_fk";
  
  ALTER TABLE "newsletters" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "newsletters" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  UPDATE "newsletters" SET "status" = 'failed' WHERE "status" = 'sending';
  DROP TYPE "public"."enum_newsletters_status";
  CREATE TYPE "public"."enum_newsletters_status" AS ENUM('draft', 'sent', 'failed');
  ALTER TABLE "newsletters" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_newsletters_status";
  ALTER TABLE "newsletters" ALTER COLUMN "status" SET DATA TYPE "public"."enum_newsletters_status" USING "status"::"public"."enum_newsletters_status";
  ALTER TABLE "_newsletters_v" ALTER COLUMN "version_status" SET DATA TYPE text;
  ALTER TABLE "_newsletters_v" ALTER COLUMN "version_status" SET DEFAULT 'draft'::text;
  UPDATE "_newsletters_v" SET "version_status" = 'failed' WHERE "version_status" = 'sending';
  DROP TYPE "public"."enum__newsletters_v_version_status";
  CREATE TYPE "public"."enum__newsletters_v_version_status" AS ENUM('draft', 'sent', 'failed');
  ALTER TABLE "_newsletters_v" ALTER COLUMN "version_status" SET DEFAULT 'draft'::"public"."enum__newsletters_v_version_status";
  ALTER TABLE "_newsletters_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__newsletters_v_version_status" USING "version_status"::"public"."enum__newsletters_v_version_status";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_subscribers_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_newsletter_deliveries_id_idx";
  ALTER TABLE "newsletters" DROP COLUMN "progress_total_batches";
  ALTER TABLE "newsletters" DROP COLUMN "progress_sent_batches";
  ALTER TABLE "newsletters" DROP COLUMN "progress_failed_recipients";
  ALTER TABLE "newsletters" DROP COLUMN "progress_started_at";
  ALTER TABLE "newsletters" DROP COLUMN "progress_last_error";
  ALTER TABLE "_newsletters_v" DROP COLUMN "version_progress_total_batches";
  ALTER TABLE "_newsletters_v" DROP COLUMN "version_progress_sent_batches";
  ALTER TABLE "_newsletters_v" DROP COLUMN "version_progress_failed_recipients";
  ALTER TABLE "_newsletters_v" DROP COLUMN "version_progress_started_at";
  ALTER TABLE "_newsletters_v" DROP COLUMN "version_progress_last_error";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subscribers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletter_deliveries_id";
  DROP TYPE "public"."enum_subscribers_interests";
  DROP TYPE "public"."enum_subscribers_locale";
  DROP TYPE "public"."enum_subscribers_status";
  DROP TYPE "public"."enum_subscribers_source";
  DROP TYPE "public"."enum_newsletter_deliveries_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_subscribers_interests" AS ENUM('newsletter', 'events');
  CREATE TYPE "public"."enum_subscribers_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_subscribers_status" AS ENUM('pending', 'confirmed', 'unsubscribed', 'bounced', 'complained');
  CREATE TYPE "public"."enum_subscribers_source" AS ENUM('footer', 'popup', 'newsletter-page', 'mailpoet-import', 'admin');
  CREATE TYPE "public"."enum_newsletter_deliveries_status" AS ENUM('pending', 'sent', 'failed');
  ALTER TYPE "public"."enum_newsletters_status" ADD VALUE 'sending' BEFORE 'sent';
  ALTER TYPE "public"."enum__newsletters_v_version_status" ADD VALUE 'sending' BEFORE 'sent';
  CREATE TABLE "subscribers_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_subscribers_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"first_name" varchar,
  	"locale" "enum_subscribers_locale" DEFAULT 'en' NOT NULL,
  	"status" "enum_subscribers_status" DEFAULT 'pending' NOT NULL,
  	"consent_at" timestamp(3) with time zone,
  	"confirmed_at" timestamp(3) with time zone,
  	"unsubscribed_at" timestamp(3) with time zone,
  	"source" "enum_subscribers_source",
  	"confirm_token" varchar,
  	"preferences_token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_deliveries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"newsletter_id" integer NOT NULL,
  	"subscriber_id" integer NOT NULL,
  	"batch" numeric NOT NULL,
  	"status" "enum_newsletter_deliveries_status" DEFAULT 'pending' NOT NULL,
  	"attempts" numeric DEFAULT 0,
  	"message_id" varchar,
  	"error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "newsletters" ADD COLUMN "progress_total_batches" numeric;
  ALTER TABLE "newsletters" ADD COLUMN "progress_sent_batches" numeric;
  ALTER TABLE "newsletters" ADD COLUMN "progress_failed_recipients" numeric;
  ALTER TABLE "newsletters" ADD COLUMN "progress_started_at" timestamp(3) with time zone;
  ALTER TABLE "newsletters" ADD COLUMN "progress_last_error" varchar;
  ALTER TABLE "_newsletters_v" ADD COLUMN "version_progress_total_batches" numeric;
  ALTER TABLE "_newsletters_v" ADD COLUMN "version_progress_sent_batches" numeric;
  ALTER TABLE "_newsletters_v" ADD COLUMN "version_progress_failed_recipients" numeric;
  ALTER TABLE "_newsletters_v" ADD COLUMN "version_progress_started_at" timestamp(3) with time zone;
  ALTER TABLE "_newsletters_v" ADD COLUMN "version_progress_last_error" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subscribers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletter_deliveries_id" integer;
  ALTER TABLE "subscribers_interests" ADD CONSTRAINT "subscribers_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletter_deliveries" ADD CONSTRAINT "newsletter_deliveries_newsletter_id_newsletters_id_fk" FOREIGN KEY ("newsletter_id") REFERENCES "public"."newsletters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletter_deliveries" ADD CONSTRAINT "newsletter_deliveries_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "subscribers_interests_order_idx" ON "subscribers_interests" USING btree ("order");
  CREATE INDEX "subscribers_interests_parent_idx" ON "subscribers_interests" USING btree ("parent_id");
  CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");
  CREATE INDEX "subscribers_status_idx" ON "subscribers" USING btree ("status");
  CREATE INDEX "subscribers_confirm_token_idx" ON "subscribers" USING btree ("confirm_token");
  CREATE INDEX "subscribers_preferences_token_idx" ON "subscribers" USING btree ("preferences_token");
  CREATE INDEX "subscribers_updated_at_idx" ON "subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
  CREATE INDEX "newsletter_deliveries_newsletter_idx" ON "newsletter_deliveries" USING btree ("newsletter_id");
  CREATE INDEX "newsletter_deliveries_subscriber_idx" ON "newsletter_deliveries" USING btree ("subscriber_id");
  CREATE INDEX "newsletter_deliveries_batch_idx" ON "newsletter_deliveries" USING btree ("batch");
  CREATE INDEX "newsletter_deliveries_status_idx" ON "newsletter_deliveries" USING btree ("status");
  CREATE INDEX "newsletter_deliveries_updated_at_idx" ON "newsletter_deliveries" USING btree ("updated_at");
  CREATE INDEX "newsletter_deliveries_created_at_idx" ON "newsletter_deliveries" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_deliveries_fk" FOREIGN KEY ("newsletter_deliveries_id") REFERENCES "public"."newsletter_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_deliveries_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_deliveries_id");`)
}
