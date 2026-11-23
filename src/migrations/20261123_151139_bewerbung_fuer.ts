import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_application_for" AS ENUM('dinner', 'event');
  CREATE TYPE "public"."enum__events_v_version_application_for" AS ENUM('dinner', 'event');
  ALTER TABLE "events" ADD COLUMN "application_for" "enum_events_application_for" DEFAULT 'dinner';
  ALTER TABLE "_events_v" ADD COLUMN "version_application_for" "enum__events_v_version_application_for" DEFAULT 'dinner';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN "application_for";
  ALTER TABLE "_events_v" DROP COLUMN "version_application_for";
  DROP TYPE "public"."enum_events_application_for";
  DROP TYPE "public"."enum__events_v_version_application_for";`)
}
