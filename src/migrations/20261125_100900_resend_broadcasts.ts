import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "newsletters" ADD COLUMN "resend_broadcast_en" varchar;
  ALTER TABLE "newsletters" ADD COLUMN "resend_broadcast_de" varchar;
  ALTER TABLE "newsletters" ADD COLUMN "resend_last_error" varchar;
  ALTER TABLE "_newsletters_v" ADD COLUMN "version_resend_broadcast_en" varchar;
  ALTER TABLE "_newsletters_v" ADD COLUMN "version_resend_broadcast_de" varchar;
  ALTER TABLE "_newsletters_v" ADD COLUMN "version_resend_last_error" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "newsletters" DROP COLUMN "resend_broadcast_en";
  ALTER TABLE "newsletters" DROP COLUMN "resend_broadcast_de";
  ALTER TABLE "newsletters" DROP COLUMN "resend_last_error";
  ALTER TABLE "_newsletters_v" DROP COLUMN "version_resend_broadcast_en";
  ALTER TABLE "_newsletters_v" DROP COLUMN "version_resend_broadcast_de";
  ALTER TABLE "_newsletters_v" DROP COLUMN "version_resend_last_error";`)
}
