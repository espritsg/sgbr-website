import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "events_recap_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "events_recap_chapters_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_events_v_version_recap_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_recap_chapters_locales" (
  	"heading" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "people" ADD COLUMN "bio_needs_review" boolean DEFAULT false;
  ALTER TABLE "_people_v" ADD COLUMN "version_bio_needs_review" boolean DEFAULT false;
  ALTER TABLE "events_locales" ADD COLUMN "recap_title" varchar;
  ALTER TABLE "events_locales" ADD COLUMN "recap_intro" jsonb;
  ALTER TABLE "_events_v_locales" ADD COLUMN "version_recap_title" varchar;
  ALTER TABLE "_events_v_locales" ADD COLUMN "version_recap_intro" jsonb;
  ALTER TABLE "team_members" ADD COLUMN "email" varchar;
  ALTER TABLE "team_members" ADD COLUMN "linkedin" varchar;
  ALTER TABLE "_team_members_v" ADD COLUMN "version_email" varchar;
  ALTER TABLE "_team_members_v" ADD COLUMN "version_linkedin" varchar;
  ALTER TABLE "events_recap_chapters" ADD CONSTRAINT "events_recap_chapters_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_recap_chapters" ADD CONSTRAINT "events_recap_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_recap_chapters_locales" ADD CONSTRAINT "events_recap_chapters_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_recap_chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_recap_chapters" ADD CONSTRAINT "_events_v_version_recap_chapters_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_recap_chapters" ADD CONSTRAINT "_events_v_version_recap_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_recap_chapters_locales" ADD CONSTRAINT "_events_v_version_recap_chapters_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_version_recap_chapters"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_recap_chapters_order_idx" ON "events_recap_chapters" USING btree ("_order");
  CREATE INDEX "events_recap_chapters_parent_id_idx" ON "events_recap_chapters" USING btree ("_parent_id");
  CREATE INDEX "events_recap_chapters_image_idx" ON "events_recap_chapters" USING btree ("image_id");
  CREATE UNIQUE INDEX "events_recap_chapters_locales_locale_parent_id_unique" ON "events_recap_chapters_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_recap_chapters_locales_parent_id_idx" ON "events_recap_chapters_locales" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_recap_chapters_order_idx" ON "_events_v_version_recap_chapters" USING btree ("_order");
  CREATE INDEX "_events_v_version_recap_chapters_parent_id_idx" ON "_events_v_version_recap_chapters" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_recap_chapters_image_idx" ON "_events_v_version_recap_chapters" USING btree ("image_id");
  CREATE UNIQUE INDEX "_events_v_version_recap_chapters_locales_locale_parent_id_un" ON "_events_v_version_recap_chapters_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_events_v_version_recap_chapters_locales_parent_id_idx" ON "_events_v_version_recap_chapters_locales" USING btree ("_parent_id");
  CREATE INDEX "people_bio_needs_review_idx" ON "people" USING btree ("bio_needs_review");
  CREATE INDEX "_people_v_version_version_bio_needs_review_idx" ON "_people_v" USING btree ("version_bio_needs_review");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_recap_chapters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_recap_chapters_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_recap_chapters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_recap_chapters_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "events_recap_chapters" CASCADE;
  DROP TABLE "events_recap_chapters_locales" CASCADE;
  DROP TABLE "_events_v_version_recap_chapters" CASCADE;
  DROP TABLE "_events_v_version_recap_chapters_locales" CASCADE;
  DROP INDEX "people_bio_needs_review_idx";
  DROP INDEX "_people_v_version_version_bio_needs_review_idx";
  ALTER TABLE "people" DROP COLUMN "bio_needs_review";
  ALTER TABLE "_people_v" DROP COLUMN "version_bio_needs_review";
  ALTER TABLE "events_locales" DROP COLUMN "recap_title";
  ALTER TABLE "events_locales" DROP COLUMN "recap_intro";
  ALTER TABLE "_events_v_locales" DROP COLUMN "version_recap_title";
  ALTER TABLE "_events_v_locales" DROP COLUMN "version_recap_intro";
  ALTER TABLE "team_members" DROP COLUMN "email";
  ALTER TABLE "team_members" DROP COLUMN "linkedin";
  ALTER TABLE "_team_members_v" DROP COLUMN "version_email";
  ALTER TABLE "_team_members_v" DROP COLUMN "version_linkedin";`)
}
