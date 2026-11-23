import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_image_text_image_position" ADD VALUE 'full';
  ALTER TYPE "public"."enum__pages_v_blocks_image_text_image_position" ADD VALUE 'full';
  DROP INDEX "posts_meta_meta_image_idx";
  DROP INDEX "_posts_v_version_meta_version_meta_image_idx";
  DROP INDEX "issues_meta_meta_image_idx";
  DROP INDEX "_issues_v_version_meta_version_meta_image_idx";
  DROP INDEX "events_meta_meta_image_idx";
  DROP INDEX "_events_v_version_meta_version_meta_image_idx";
  DROP INDEX "pages_meta_meta_image_idx";
  DROP INDEX "_pages_v_version_meta_version_meta_image_idx";
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id");
  CREATE INDEX "issues_meta_meta_image_idx" ON "issues_locales" USING btree ("meta_image_id");
  CREATE INDEX "_issues_v_version_meta_version_meta_image_idx" ON "_issues_v_locales" USING btree ("version_meta_image_id");
  CREATE INDEX "events_meta_meta_image_idx" ON "events_locales" USING btree ("meta_image_id");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v_locales" USING btree ("version_meta_image_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_image_text" ALTER COLUMN "image_position" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_image_text" ALTER COLUMN "image_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_blocks_image_text_image_position";
  CREATE TYPE "public"."enum_pages_blocks_image_text_image_position" AS ENUM('left', 'right');
  ALTER TABLE "pages_blocks_image_text" ALTER COLUMN "image_position" SET DEFAULT 'left'::"public"."enum_pages_blocks_image_text_image_position";
  ALTER TABLE "pages_blocks_image_text" ALTER COLUMN "image_position" SET DATA TYPE "public"."enum_pages_blocks_image_text_image_position" USING "image_position"::"public"."enum_pages_blocks_image_text_image_position";
  ALTER TABLE "_pages_v_blocks_image_text" ALTER COLUMN "image_position" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_image_text" ALTER COLUMN "image_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__pages_v_blocks_image_text_image_position";
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_image_position" AS ENUM('left', 'right');
  ALTER TABLE "_pages_v_blocks_image_text" ALTER COLUMN "image_position" SET DEFAULT 'left'::"public"."enum__pages_v_blocks_image_text_image_position";
  ALTER TABLE "_pages_v_blocks_image_text" ALTER COLUMN "image_position" SET DATA TYPE "public"."enum__pages_v_blocks_image_text_image_position" USING "image_position"::"public"."enum__pages_v_blocks_image_text_image_position";
  DROP INDEX "posts_meta_meta_image_idx";
  DROP INDEX "_posts_v_version_meta_version_meta_image_idx";
  DROP INDEX "issues_meta_meta_image_idx";
  DROP INDEX "_issues_v_version_meta_version_meta_image_idx";
  DROP INDEX "events_meta_meta_image_idx";
  DROP INDEX "_events_v_version_meta_version_meta_image_idx";
  DROP INDEX "pages_meta_meta_image_idx";
  DROP INDEX "_pages_v_version_meta_version_meta_image_idx";
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX "issues_meta_meta_image_idx" ON "issues_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX "_issues_v_version_meta_version_meta_image_idx" ON "_issues_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX "events_meta_meta_image_idx" ON "events_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");`)
}
