import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_posts_type" AS ENUM('interview', 'guest-article');
  CREATE TYPE "public"."enum_posts_original_language" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_type" AS ENUM('interview', 'guest-article');
  CREATE TYPE "public"."enum__posts_v_version_original_language" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_people_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_issues_format" AS ENUM('digital', 'pdf');
  CREATE TYPE "public"."enum_issues_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__issues_v_version_format" AS ENUM('digital', 'pdf');
  CREATE TYPE "public"."enum__issues_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__issues_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_events_language" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_language" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_topics_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__topics_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__topics_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_team_members_group" AS ENUM('editorial-board', 'editors', 'advisory');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_group" AS ENUM('editorial-board', 'editors', 'advisory');
  CREATE TYPE "public"."enum__team_members_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_pages_blocks_team_grid_groups" AS ENUM('editorial-board', 'editors', 'advisory');
  CREATE TYPE "public"."enum_pages_blocks_image_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_team_grid_groups" AS ENUM('editorial-board', 'editors', 'advisory');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_newsletters_audience" AS ENUM('newsletter', 'events');
  CREATE TYPE "public"."enum_newsletters_status" AS ENUM('draft', 'sending', 'sent', 'failed');
  CREATE TYPE "public"."enum__newsletters_v_version_audience" AS ENUM('newsletter', 'events');
  CREATE TYPE "public"."enum__newsletters_v_version_status" AS ENUM('draft', 'sending', 'sent', 'failed');
  CREATE TYPE "public"."enum_subscribers_interests" AS ENUM('newsletter', 'events');
  CREATE TYPE "public"."enum_subscribers_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_subscribers_status" AS ENUM('pending', 'confirmed', 'unsubscribed', 'bounced', 'complained');
  CREATE TYPE "public"."enum_subscribers_source" AS ENUM('footer', 'popup', 'newsletter-page', 'mailpoet-import', 'admin');
  CREATE TYPE "public"."enum_newsletter_deliveries_status" AS ENUM('pending', 'sent', 'failed');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'board', 'editor', 'advisory');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302', '307', '308');
  CREATE TYPE "public"."enum_forms_blocks_upload_upload_collection" AS ENUM('application-files');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_forms_redirect_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_exports_format" AS ENUM('csv', 'json');
  CREATE TYPE "public"."enum_exports_sort_order" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_exports_locale" AS ENUM('all', 'en', 'de');
  CREATE TYPE "public"."enum_exports_drafts" AS ENUM('yes', 'no');
  CREATE TYPE "public"."enum_imports_import_mode" AS ENUM('create', 'update', 'upsert');
  CREATE TYPE "public"."enum_imports_status" AS ENUM('pending', 'completed', 'partial', 'failed');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'dailyMaintenance', 'createCollectionExport', 'createCollectionImport', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'dailyMaintenance', 'createCollectionExport', 'createCollectionImport', 'schedulePublish');
  CREATE TYPE "public"."enum_footer_social_links_platform" AS ENUM('instagram', 'linkedin', 'youtube', 'x', 'spotify');
  CREATE TYPE "public"."enum_site_settings_social_profiles_platform" AS ENUM('instagram', 'linkedin', 'youtube', 'x', 'spotify');
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_posts_type" DEFAULT 'interview',
  	"hero_image_id" integer,
  	"issue_id" integer,
  	"issue_image_id" integer,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"original_language" "enum_posts_original_language" DEFAULT 'en',
  	"summary_needs_review" boolean DEFAULT false,
  	"wp_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"people_id" integer,
  	"team_members_id" integer,
  	"topics_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_type" "enum__posts_v_version_type" DEFAULT 'interview',
  	"version_hero_image_id" integer,
  	"version_issue_id" integer,
  	"version_issue_image_id" integer,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_original_language" "enum__posts_v_version_original_language" DEFAULT 'en',
  	"version_summary_needs_review" boolean DEFAULT false,
  	"version_wp_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"people_id" integer,
  	"team_members_id" integer,
  	"topics_id" integer
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"organization" varchar,
  	"photo_id" integer,
  	"organization_logo_id" integer,
  	"linkedin" varchar,
  	"wp_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_people_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "people_locales" (
  	"role" varchar,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_people_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_organization" varchar,
  	"version_photo_id" integer,
  	"version_organization_logo_id" integer,
  	"version_linkedin" varchar,
  	"version_wp_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__people_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__people_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_people_v_locales" (
  	"version_role" varchar,
  	"version_bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "issues" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_id" integer,
  	"pdf_id" integer,
  	"slug" varchar,
  	"year" numeric,
  	"format" "enum_issues_format" DEFAULT 'digital',
  	"wp_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_issues_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "issues_locales" (
  	"title" varchar,
  	"tagline" varchar,
  	"description" varchar,
  	"foreword" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "issues_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"team_members_id" integer
  );
  
  CREATE TABLE "_issues_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_cover_id" integer,
  	"version_pdf_id" integer,
  	"version_slug" varchar,
  	"version_year" numeric,
  	"version_format" "enum__issues_v_version_format" DEFAULT 'digital',
  	"version_wp_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__issues_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__issues_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_issues_v_locales" (
  	"version_title" varchar,
  	"version_tagline" varchar,
  	"version_description" varchar,
  	"version_foreword" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_issues_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"team_members_id" integer
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"speaker_id" integer,
  	"starts_at" timestamp(3) with time zone,
  	"language" "enum_events_language" DEFAULT 'en',
  	"location" varchar,
  	"application_form_id" integer,
  	"application_opens_at" timestamp(3) with time zone,
  	"application_deadline" timestamp(3) with time zone,
  	"recap_id" integer,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_speaker_id" integer,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_language" "enum__events_v_version_language" DEFAULT 'en',
  	"version_location" varchar,
  	"version_application_form_id" integer,
  	"version_application_opens_at" timestamp(3) with time zone,
  	"version_application_deadline" timestamp(3) with time zone,
  	"version_recap_id" integer,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__events_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_events_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"parent_id" integer,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_topics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "topics_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_parent_id" integer,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__topics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__topics_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_topics_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"photo_id" integer,
  	"group" "enum_team_members_group" DEFAULT 'editors',
  	"university" varchar,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_members_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "team_members_locales" (
  	"position" varchar,
  	"study" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_team_members_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_photo_id" integer,
  	"version_group" "enum__team_members_v_version_group" DEFAULT 'editors',
  	"version_university" varchar,
  	"version_active" boolean DEFAULT true,
  	"version_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__team_members_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_team_members_v_locales" (
  	"version_position" varchar,
  	"version_study" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_grid_groups" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_team_grid_groups",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"form_id" integer,
  	"show_address" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"content" jsonb,
  	"image_position" "enum_pages_blocks_image_text_image_position" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_grid_groups" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_team_grid_groups",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_team_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"form_id" integer,
  	"show_address" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"content" jsonb,
  	"image_position" "enum__pages_v_blocks_image_text_image_position" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"legacy_path" varchar,
  	"wp_id" numeric,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "newsletters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"audience" "enum_newsletters_audience" DEFAULT 'newsletter' NOT NULL,
  	"scheduled_for" timestamp(3) with time zone,
  	"status" "enum_newsletters_status" DEFAULT 'draft' NOT NULL,
  	"sent_at" timestamp(3) with time zone,
  	"recipient_count" numeric,
  	"progress_total_batches" numeric,
  	"progress_sent_batches" numeric,
  	"progress_failed_recipients" numeric,
  	"progress_started_at" timestamp(3) with time zone,
  	"progress_last_error" varchar,
  	"show_in_archive" boolean DEFAULT true,
  	"archive_delay_days" numeric DEFAULT 30,
  	"archive_visible_from" timestamp(3) with time zone,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletters_locales" (
  	"title" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"preview_text" varchar,
  	"intro" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "newsletters_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "_newsletters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_audience" "enum__newsletters_v_version_audience" DEFAULT 'newsletter' NOT NULL,
  	"version_scheduled_for" timestamp(3) with time zone,
  	"version_status" "enum__newsletters_v_version_status" DEFAULT 'draft' NOT NULL,
  	"version_sent_at" timestamp(3) with time zone,
  	"version_recipient_count" numeric,
  	"version_progress_total_batches" numeric,
  	"version_progress_sent_batches" numeric,
  	"version_progress_failed_recipients" numeric,
  	"version_progress_started_at" timestamp(3) with time zone,
  	"version_progress_last_error" varchar,
  	"version_show_in_archive" boolean DEFAULT true,
  	"version_archive_delay_days" numeric DEFAULT 30,
  	"version_archive_visible_from" timestamp(3) with time zone,
  	"version_slug" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_newsletters_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_subject" varchar NOT NULL,
  	"version_preview_text" varchar,
  	"version_intro" varchar,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_newsletters_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
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
  
  CREATE TABLE "application_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar DEFAULT 'application-files',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "rate_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL,
  	"window_start" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'advisory' NOT NULL,
  	"team_member_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_redirects_type" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"pages_id" integer,
  	"issues_id" integer,
  	"events_id" integer,
  	"people_id" integer,
  	"topics_id" integer
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"priority" numeric,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"issues_id" integer,
  	"events_id" integer,
  	"people_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_checkbox_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message_locales" (
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_upload_mime_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mime_type" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_upload" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"upload_collection" "enum_forms_blocks_upload_upload_collection" NOT NULL,
  	"width" numeric,
  	"max_file_size" numeric,
  	"required" boolean,
  	"multiple" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_upload_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar
  );
  
  CREATE TABLE "forms_emails_locales" (
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"redirect_type" "enum_forms_redirect_type" DEFAULT 'reference',
  	"redirect_url" varchar,
  	"retention_months" numeric DEFAULT 6 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "forms_locales" (
  	"submit_button_label" varchar,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "forms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_uploads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"event_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"application_files_id" integer
  );
  
  CREATE TABLE "exports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"format" "enum_exports_format" DEFAULT 'csv' NOT NULL,
  	"limit" numeric,
  	"page" numeric DEFAULT 1,
  	"sort" varchar,
  	"sort_order" "enum_exports_sort_order",
  	"locale" "enum_exports_locale" DEFAULT 'all',
  	"drafts" "enum_exports_drafts" DEFAULT 'yes',
  	"collection_slug" varchar DEFAULT 'posts' NOT NULL,
  	"where" jsonb DEFAULT '{}'::jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "exports_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "imports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"collection_slug" varchar NOT NULL,
  	"import_mode" "enum_imports_import_mode",
  	"match_field" varchar DEFAULT 'id',
  	"status" "enum_imports_status" DEFAULT 'pending',
  	"summary_imported" numeric,
  	"summary_updated" numeric,
  	"summary_total" numeric,
  	"summary_issues" numeric,
  	"summary_issue_details" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"posts_find" boolean DEFAULT false,
  	"posts_create" boolean DEFAULT false,
  	"posts_update" boolean DEFAULT false,
  	"people_find" boolean DEFAULT false,
  	"people_create" boolean DEFAULT false,
  	"people_update" boolean DEFAULT false,
  	"events_find" boolean DEFAULT false,
  	"events_create" boolean DEFAULT false,
  	"events_update" boolean DEFAULT false,
  	"media_find" boolean DEFAULT false,
  	"media_create" boolean DEFAULT false,
  	"media_update" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"people_id" integer,
  	"issues_id" integer,
  	"events_id" integer,
  	"topics_id" integer,
  	"team_members_id" integer,
  	"pages_id" integer,
  	"media_id" integer,
  	"newsletters_id" integer,
  	"subscribers_id" integer,
  	"newsletter_deliveries_id" integer,
  	"application_files_id" integer,
  	"rate_limits_id" integer,
  	"users_id" integer,
  	"redirects_id" integer,
  	"search_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"payload_mcp_api_keys_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"payload_mcp_api_keys_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"current_issue_id" integer,
  	"show_topic_section" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "header_nav_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"newsletter_text" varchar,
  	"esprit_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_social_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_social_profiles_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_seo_image_id" integer,
  	"contact_email" varchar,
  	"address" varchar,
  	"newsletter_popup_enabled" boolean DEFAULT false,
  	"newsletter_popup_delay_seconds" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"default_seo_title" varchar,
  	"default_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_issue_image_id_media_id_fk" FOREIGN KEY ("issue_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_issue_id_issues_id_fk" FOREIGN KEY ("version_issue_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_issue_image_id_media_id_fk" FOREIGN KEY ("version_issue_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_organization_logo_id_media_id_fk" FOREIGN KEY ("organization_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_locales" ADD CONSTRAINT "people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_parent_id_people_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_organization_logo_id_media_id_fk" FOREIGN KEY ("version_organization_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v_locales" ADD CONSTRAINT "_people_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_people_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "issues" ADD CONSTRAINT "issues_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "issues" ADD CONSTRAINT "issues_pdf_id_media_id_fk" FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "issues_locales" ADD CONSTRAINT "issues_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "issues_locales" ADD CONSTRAINT "issues_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "issues_rels" ADD CONSTRAINT "issues_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "issues_rels" ADD CONSTRAINT "issues_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_issues_v" ADD CONSTRAINT "_issues_v_parent_id_issues_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_issues_v" ADD CONSTRAINT "_issues_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_issues_v" ADD CONSTRAINT "_issues_v_version_pdf_id_media_id_fk" FOREIGN KEY ("version_pdf_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_issues_v_locales" ADD CONSTRAINT "_issues_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_issues_v_locales" ADD CONSTRAINT "_issues_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_issues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_issues_v_rels" ADD CONSTRAINT "_issues_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_issues_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_issues_v_rels" ADD CONSTRAINT "_issues_v_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_speaker_id_people_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_application_form_id_forms_id_fk" FOREIGN KEY ("application_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_recap_id_posts_id_fk" FOREIGN KEY ("recap_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_speaker_id_people_id_fk" FOREIGN KEY ("version_speaker_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_application_form_id_forms_id_fk" FOREIGN KEY ("version_application_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_recap_id_posts_id_fk" FOREIGN KEY ("version_recap_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_locales" ADD CONSTRAINT "_events_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_locales" ADD CONSTRAINT "_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_locales" ADD CONSTRAINT "topics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_version_parent_id_topics_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_locales" ADD CONSTRAINT "_topics_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_locales" ADD CONSTRAINT "team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_parent_id_team_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v_locales" ADD CONSTRAINT "_team_members_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_grid_groups" ADD CONSTRAINT "pages_blocks_team_grid_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_team_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_grid" ADD CONSTRAINT "pages_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form" ADD CONSTRAINT "pages_blocks_contact_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form" ADD CONSTRAINT "pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_grid_groups" ADD CONSTRAINT "_pages_v_blocks_team_grid_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_team_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_grid" ADD CONSTRAINT "_pages_v_blocks_team_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form" ADD CONSTRAINT "_pages_v_blocks_contact_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form" ADD CONSTRAINT "_pages_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_locales" ADD CONSTRAINT "newsletters_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_rels" ADD CONSTRAINT "newsletters_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_rels" ADD CONSTRAINT "newsletters_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_parent_id_newsletters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_locales" ADD CONSTRAINT "_newsletters_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_rels" ADD CONSTRAINT "_newsletters_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_rels" ADD CONSTRAINT "_newsletters_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscribers_interests" ADD CONSTRAINT "subscribers_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletter_deliveries" ADD CONSTRAINT "newsletter_deliveries_newsletter_id_newsletters_id_fk" FOREIGN KEY ("newsletter_id") REFERENCES "public"."newsletters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletter_deliveries" ADD CONSTRAINT "newsletter_deliveries_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_team_member_id_team_members_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_issues_fk" FOREIGN KEY ("issues_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_locales" ADD CONSTRAINT "search_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_issues_fk" FOREIGN KEY ("issues_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox_locales" ADD CONSTRAINT "forms_blocks_checkbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_checkbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country_locales" ADD CONSTRAINT "forms_blocks_country_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_country"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email_locales" ADD CONSTRAINT "forms_blocks_email_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_email"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message_locales" ADD CONSTRAINT "forms_blocks_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number_locales" ADD CONSTRAINT "forms_blocks_number_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_number"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options_locales" ADD CONSTRAINT "forms_blocks_select_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_locales" ADD CONSTRAINT "forms_blocks_select_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text_locales" ADD CONSTRAINT "forms_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea_locales" ADD CONSTRAINT "forms_blocks_textarea_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_textarea"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_upload_mime_types" ADD CONSTRAINT "forms_blocks_upload_mime_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_upload"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_upload" ADD CONSTRAINT "forms_blocks_upload_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_upload_locales" ADD CONSTRAINT "forms_blocks_upload_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_upload"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails_locales" ADD CONSTRAINT "forms_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_locales" ADD CONSTRAINT "forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_rels" ADD CONSTRAINT "forms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_rels" ADD CONSTRAINT "forms_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_rels" ADD CONSTRAINT "forms_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_rels" ADD CONSTRAINT "forms_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_uploads" ADD CONSTRAINT "form_submissions_submission_uploads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions_rels" ADD CONSTRAINT "form_submissions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_rels" ADD CONSTRAINT "form_submissions_rels_application_files_fk" FOREIGN KEY ("application_files_id") REFERENCES "public"."application_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exports_texts" ADD CONSTRAINT "exports_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_issues_fk" FOREIGN KEY ("issues_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletters_fk" FOREIGN KEY ("newsletters_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_deliveries_fk" FOREIGN KEY ("newsletter_deliveries_id") REFERENCES "public"."newsletter_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_application_files_fk" FOREIGN KEY ("application_files_id") REFERENCES "public"."application_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rate_limits_fk" FOREIGN KEY ("rate_limits_id") REFERENCES "public"."rate_limits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_current_issue_id_issues_id_fk" FOREIGN KEY ("current_issue_id") REFERENCES "public"."issues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_locales" ADD CONSTRAINT "header_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_links_locales" ADD CONSTRAINT "footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_profiles" ADD CONSTRAINT "site_settings_social_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_seo_image_id_media_id_fk" FOREIGN KEY ("default_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_issue_idx" ON "posts" USING btree ("issue_id");
  CREATE INDEX "posts_issue_image_idx" ON "posts" USING btree ("issue_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
  CREATE INDEX "posts_summary_needs_review_idx" ON "posts" USING btree ("summary_needs_review");
  CREATE UNIQUE INDEX "posts_wp_id_idx" ON "posts" USING btree ("wp_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_locales_parent_id_idx" ON "posts_locales" USING btree ("_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_people_id_idx" ON "posts_rels" USING btree ("people_id");
  CREATE INDEX "posts_rels_team_members_id_idx" ON "posts_rels" USING btree ("team_members_id");
  CREATE INDEX "posts_rels_topics_id_idx" ON "posts_rels" USING btree ("topics_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_version_issue_idx" ON "_posts_v" USING btree ("version_issue_id");
  CREATE INDEX "_posts_v_version_version_issue_image_idx" ON "_posts_v" USING btree ("version_issue_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_version_summary_needs_review_idx" ON "_posts_v" USING btree ("version_summary_needs_review");
  CREATE INDEX "_posts_v_version_version_wp_id_idx" ON "_posts_v" USING btree ("version_wp_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_locales_parent_id_idx" ON "_posts_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_people_id_idx" ON "_posts_v_rels" USING btree ("people_id");
  CREATE INDEX "_posts_v_rels_team_members_id_idx" ON "_posts_v_rels" USING btree ("team_members_id");
  CREATE INDEX "_posts_v_rels_topics_id_idx" ON "_posts_v_rels" USING btree ("topics_id");
  CREATE UNIQUE INDEX "people_slug_idx" ON "people" USING btree ("slug");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE INDEX "people_organization_logo_idx" ON "people" USING btree ("organization_logo_id");
  CREATE UNIQUE INDEX "people_wp_id_idx" ON "people" USING btree ("wp_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "people__status_idx" ON "people" USING btree ("_status");
  CREATE UNIQUE INDEX "people_locales_locale_parent_id_unique" ON "people_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "people_locales_parent_id_idx" ON "people_locales" USING btree ("_parent_id");
  CREATE INDEX "_people_v_parent_idx" ON "_people_v" USING btree ("parent_id");
  CREATE INDEX "_people_v_version_version_slug_idx" ON "_people_v" USING btree ("version_slug");
  CREATE INDEX "_people_v_version_version_photo_idx" ON "_people_v" USING btree ("version_photo_id");
  CREATE INDEX "_people_v_version_version_organization_logo_idx" ON "_people_v" USING btree ("version_organization_logo_id");
  CREATE INDEX "_people_v_version_version_wp_id_idx" ON "_people_v" USING btree ("version_wp_id");
  CREATE INDEX "_people_v_version_version_updated_at_idx" ON "_people_v" USING btree ("version_updated_at");
  CREATE INDEX "_people_v_version_version_created_at_idx" ON "_people_v" USING btree ("version_created_at");
  CREATE INDEX "_people_v_version_version__status_idx" ON "_people_v" USING btree ("version__status");
  CREATE INDEX "_people_v_created_at_idx" ON "_people_v" USING btree ("created_at");
  CREATE INDEX "_people_v_updated_at_idx" ON "_people_v" USING btree ("updated_at");
  CREATE INDEX "_people_v_snapshot_idx" ON "_people_v" USING btree ("snapshot");
  CREATE INDEX "_people_v_published_locale_idx" ON "_people_v" USING btree ("published_locale");
  CREATE INDEX "_people_v_latest_idx" ON "_people_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_people_v_locales_locale_parent_id_unique" ON "_people_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_people_v_locales_parent_id_idx" ON "_people_v_locales" USING btree ("_parent_id");
  CREATE INDEX "issues_cover_idx" ON "issues" USING btree ("cover_id");
  CREATE INDEX "issues_pdf_idx" ON "issues" USING btree ("pdf_id");
  CREATE UNIQUE INDEX "issues_slug_idx" ON "issues" USING btree ("slug");
  CREATE INDEX "issues_year_idx" ON "issues" USING btree ("year");
  CREATE UNIQUE INDEX "issues_wp_id_idx" ON "issues" USING btree ("wp_id");
  CREATE INDEX "issues_updated_at_idx" ON "issues" USING btree ("updated_at");
  CREATE INDEX "issues_created_at_idx" ON "issues" USING btree ("created_at");
  CREATE INDEX "issues__status_idx" ON "issues" USING btree ("_status");
  CREATE INDEX "issues_meta_meta_image_idx" ON "issues_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "issues_locales_locale_parent_id_unique" ON "issues_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "issues_locales_parent_id_idx" ON "issues_locales" USING btree ("_parent_id");
  CREATE INDEX "issues_rels_order_idx" ON "issues_rels" USING btree ("order");
  CREATE INDEX "issues_rels_parent_idx" ON "issues_rels" USING btree ("parent_id");
  CREATE INDEX "issues_rels_path_idx" ON "issues_rels" USING btree ("path");
  CREATE INDEX "issues_rels_team_members_id_idx" ON "issues_rels" USING btree ("team_members_id");
  CREATE INDEX "_issues_v_parent_idx" ON "_issues_v" USING btree ("parent_id");
  CREATE INDEX "_issues_v_version_version_cover_idx" ON "_issues_v" USING btree ("version_cover_id");
  CREATE INDEX "_issues_v_version_version_pdf_idx" ON "_issues_v" USING btree ("version_pdf_id");
  CREATE INDEX "_issues_v_version_version_slug_idx" ON "_issues_v" USING btree ("version_slug");
  CREATE INDEX "_issues_v_version_version_year_idx" ON "_issues_v" USING btree ("version_year");
  CREATE INDEX "_issues_v_version_version_wp_id_idx" ON "_issues_v" USING btree ("version_wp_id");
  CREATE INDEX "_issues_v_version_version_updated_at_idx" ON "_issues_v" USING btree ("version_updated_at");
  CREATE INDEX "_issues_v_version_version_created_at_idx" ON "_issues_v" USING btree ("version_created_at");
  CREATE INDEX "_issues_v_version_version__status_idx" ON "_issues_v" USING btree ("version__status");
  CREATE INDEX "_issues_v_created_at_idx" ON "_issues_v" USING btree ("created_at");
  CREATE INDEX "_issues_v_updated_at_idx" ON "_issues_v" USING btree ("updated_at");
  CREATE INDEX "_issues_v_snapshot_idx" ON "_issues_v" USING btree ("snapshot");
  CREATE INDEX "_issues_v_published_locale_idx" ON "_issues_v" USING btree ("published_locale");
  CREATE INDEX "_issues_v_latest_idx" ON "_issues_v" USING btree ("latest");
  CREATE INDEX "_issues_v_autosave_idx" ON "_issues_v" USING btree ("autosave");
  CREATE INDEX "_issues_v_version_meta_version_meta_image_idx" ON "_issues_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_issues_v_locales_locale_parent_id_unique" ON "_issues_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_issues_v_locales_parent_id_idx" ON "_issues_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_issues_v_rels_order_idx" ON "_issues_v_rels" USING btree ("order");
  CREATE INDEX "_issues_v_rels_parent_idx" ON "_issues_v_rels" USING btree ("parent_id");
  CREATE INDEX "_issues_v_rels_path_idx" ON "_issues_v_rels" USING btree ("path");
  CREATE INDEX "_issues_v_rels_team_members_id_idx" ON "_issues_v_rels" USING btree ("team_members_id");
  CREATE INDEX "events_speaker_idx" ON "events" USING btree ("speaker_id");
  CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");
  CREATE INDEX "events_application_form_idx" ON "events" USING btree ("application_form_id");
  CREATE INDEX "events_recap_idx" ON "events" USING btree ("recap_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_meta_meta_image_idx" ON "events_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_locales_parent_id_idx" ON "events_locales" USING btree ("_parent_id");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_media_id_idx" ON "events_rels" USING btree ("media_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_speaker_idx" ON "_events_v" USING btree ("version_speaker_id");
  CREATE INDEX "_events_v_version_version_starts_at_idx" ON "_events_v" USING btree ("version_starts_at");
  CREATE INDEX "_events_v_version_version_application_form_idx" ON "_events_v" USING btree ("version_application_form_id");
  CREATE INDEX "_events_v_version_version_recap_idx" ON "_events_v" USING btree ("version_recap_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_snapshot_idx" ON "_events_v" USING btree ("snapshot");
  CREATE INDEX "_events_v_published_locale_idx" ON "_events_v" USING btree ("published_locale");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_events_v_locales_locale_parent_id_unique" ON "_events_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_events_v_locales_parent_id_idx" ON "_events_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_media_id_idx" ON "_events_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_parent_idx" ON "topics" USING btree ("parent_id");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "topics__status_idx" ON "topics" USING btree ("_status");
  CREATE UNIQUE INDEX "topics_locales_locale_parent_id_unique" ON "topics_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_locales_parent_id_idx" ON "topics_locales" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_parent_idx" ON "_topics_v" USING btree ("parent_id");
  CREATE INDEX "_topics_v_version_version_slug_idx" ON "_topics_v" USING btree ("version_slug");
  CREATE INDEX "_topics_v_version_version_parent_idx" ON "_topics_v" USING btree ("version_parent_id");
  CREATE INDEX "_topics_v_version_version_updated_at_idx" ON "_topics_v" USING btree ("version_updated_at");
  CREATE INDEX "_topics_v_version_version_created_at_idx" ON "_topics_v" USING btree ("version_created_at");
  CREATE INDEX "_topics_v_version_version__status_idx" ON "_topics_v" USING btree ("version__status");
  CREATE INDEX "_topics_v_created_at_idx" ON "_topics_v" USING btree ("created_at");
  CREATE INDEX "_topics_v_updated_at_idx" ON "_topics_v" USING btree ("updated_at");
  CREATE INDEX "_topics_v_snapshot_idx" ON "_topics_v" USING btree ("snapshot");
  CREATE INDEX "_topics_v_published_locale_idx" ON "_topics_v" USING btree ("published_locale");
  CREATE INDEX "_topics_v_latest_idx" ON "_topics_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_topics_v_locales_locale_parent_id_unique" ON "_topics_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_locales_parent_id_idx" ON "_topics_v_locales" USING btree ("_parent_id");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "team_members__status_idx" ON "team_members" USING btree ("_status");
  CREATE UNIQUE INDEX "team_members_locales_locale_parent_id_unique" ON "team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "team_members_locales_parent_id_idx" ON "team_members_locales" USING btree ("_parent_id");
  CREATE INDEX "_team_members_v_parent_idx" ON "_team_members_v" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_version_version_photo_idx" ON "_team_members_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_members_v_version_version_updated_at_idx" ON "_team_members_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_members_v_version_version_created_at_idx" ON "_team_members_v" USING btree ("version_created_at");
  CREATE INDEX "_team_members_v_version_version__status_idx" ON "_team_members_v" USING btree ("version__status");
  CREATE INDEX "_team_members_v_created_at_idx" ON "_team_members_v" USING btree ("created_at");
  CREATE INDEX "_team_members_v_updated_at_idx" ON "_team_members_v" USING btree ("updated_at");
  CREATE INDEX "_team_members_v_snapshot_idx" ON "_team_members_v" USING btree ("snapshot");
  CREATE INDEX "_team_members_v_published_locale_idx" ON "_team_members_v" USING btree ("published_locale");
  CREATE INDEX "_team_members_v_latest_idx" ON "_team_members_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_team_members_v_locales_locale_parent_id_unique" ON "_team_members_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_team_members_v_locales_parent_id_idx" ON "_team_members_v_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_locale_idx" ON "pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_team_grid_groups_order_idx" ON "pages_blocks_team_grid_groups" USING btree ("order");
  CREATE INDEX "pages_blocks_team_grid_groups_parent_idx" ON "pages_blocks_team_grid_groups" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_team_grid_groups_locale_idx" ON "pages_blocks_team_grid_groups" USING btree ("locale");
  CREATE INDEX "pages_blocks_team_grid_order_idx" ON "pages_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_grid_parent_id_idx" ON "pages_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_grid_path_idx" ON "pages_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_grid_locale_idx" ON "pages_blocks_team_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_form_order_idx" ON "pages_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_form_parent_id_idx" ON "pages_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_form_path_idx" ON "pages_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_form_locale_idx" ON "pages_blocks_contact_form" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_form_form_idx" ON "pages_blocks_contact_form" USING btree ("form_id");
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_locale_idx" ON "pages_blocks_image_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_text_image_idx" ON "pages_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_locale_idx" ON "_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_team_grid_groups_order_idx" ON "_pages_v_blocks_team_grid_groups" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_team_grid_groups_parent_idx" ON "_pages_v_blocks_team_grid_groups" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_team_grid_groups_locale_idx" ON "_pages_v_blocks_team_grid_groups" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_team_grid_order_idx" ON "_pages_v_blocks_team_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_grid_parent_id_idx" ON "_pages_v_blocks_team_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_grid_path_idx" ON "_pages_v_blocks_team_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_grid_locale_idx" ON "_pages_v_blocks_team_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_form_order_idx" ON "_pages_v_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_form_parent_id_idx" ON "_pages_v_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_form_path_idx" ON "_pages_v_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_form_locale_idx" ON "_pages_v_blocks_contact_form" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_form_form_idx" ON "_pages_v_blocks_contact_form" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_image_text_order_idx" ON "_pages_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_text_parent_id_idx" ON "_pages_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_path_idx" ON "_pages_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_text_locale_idx" ON "_pages_v_blocks_image_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_text_image_idx" ON "_pages_v_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "media_legacy_path_idx" ON "media" USING btree ("legacy_path");
  CREATE UNIQUE INDEX "media_wp_id_idx" ON "media" USING btree ("wp_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "newsletters_status_idx" ON "newsletters" USING btree ("status");
  CREATE INDEX "newsletters_archive_visible_from_idx" ON "newsletters" USING btree ("archive_visible_from");
  CREATE UNIQUE INDEX "newsletters_slug_idx" ON "newsletters" USING btree ("slug");
  CREATE INDEX "newsletters_updated_at_idx" ON "newsletters" USING btree ("updated_at");
  CREATE INDEX "newsletters_created_at_idx" ON "newsletters" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletters_locales_locale_parent_id_unique" ON "newsletters_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "newsletters_locales_parent_id_idx" ON "newsletters_locales" USING btree ("_parent_id");
  CREATE INDEX "newsletters_rels_order_idx" ON "newsletters_rels" USING btree ("order");
  CREATE INDEX "newsletters_rels_parent_idx" ON "newsletters_rels" USING btree ("parent_id");
  CREATE INDEX "newsletters_rels_path_idx" ON "newsletters_rels" USING btree ("path");
  CREATE INDEX "newsletters_rels_posts_id_idx" ON "newsletters_rels" USING btree ("posts_id");
  CREATE INDEX "_newsletters_v_parent_idx" ON "_newsletters_v" USING btree ("parent_id");
  CREATE INDEX "_newsletters_v_version_version_status_idx" ON "_newsletters_v" USING btree ("version_status");
  CREATE INDEX "_newsletters_v_version_version_archive_visible_from_idx" ON "_newsletters_v" USING btree ("version_archive_visible_from");
  CREATE INDEX "_newsletters_v_version_version_slug_idx" ON "_newsletters_v" USING btree ("version_slug");
  CREATE INDEX "_newsletters_v_version_version_updated_at_idx" ON "_newsletters_v" USING btree ("version_updated_at");
  CREATE INDEX "_newsletters_v_version_version_created_at_idx" ON "_newsletters_v" USING btree ("version_created_at");
  CREATE INDEX "_newsletters_v_created_at_idx" ON "_newsletters_v" USING btree ("created_at");
  CREATE INDEX "_newsletters_v_updated_at_idx" ON "_newsletters_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_newsletters_v_locales_locale_parent_id_unique" ON "_newsletters_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_newsletters_v_locales_parent_id_idx" ON "_newsletters_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_rels_order_idx" ON "_newsletters_v_rels" USING btree ("order");
  CREATE INDEX "_newsletters_v_rels_parent_idx" ON "_newsletters_v_rels" USING btree ("parent_id");
  CREATE INDEX "_newsletters_v_rels_path_idx" ON "_newsletters_v_rels" USING btree ("path");
  CREATE INDEX "_newsletters_v_rels_posts_id_idx" ON "_newsletters_v_rels" USING btree ("posts_id");
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
  CREATE INDEX "application_files_updated_at_idx" ON "application_files" USING btree ("updated_at");
  CREATE INDEX "application_files_created_at_idx" ON "application_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "application_files_filename_idx" ON "application_files" USING btree ("filename");
  CREATE UNIQUE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("key");
  CREATE INDEX "rate_limits_window_start_idx" ON "rate_limits" USING btree ("window_start");
  CREATE INDEX "rate_limits_updated_at_idx" ON "rate_limits" USING btree ("updated_at");
  CREATE INDEX "rate_limits_created_at_idx" ON "rate_limits" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_team_member_idx" ON "users" USING btree ("team_member_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_issues_id_idx" ON "redirects_rels" USING btree ("issues_id");
  CREATE INDEX "redirects_rels_events_id_idx" ON "redirects_rels" USING btree ("events_id");
  CREATE INDEX "redirects_rels_people_id_idx" ON "redirects_rels" USING btree ("people_id");
  CREATE INDEX "redirects_rels_topics_id_idx" ON "redirects_rels" USING btree ("topics_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE UNIQUE INDEX "search_locales_locale_parent_id_unique" ON "search_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "search_locales_parent_id_idx" ON "search_locales" USING btree ("_parent_id");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE INDEX "search_rels_issues_id_idx" ON "search_rels" USING btree ("issues_id");
  CREATE INDEX "search_rels_events_id_idx" ON "search_rels" USING btree ("events_id");
  CREATE INDEX "search_rels_people_id_idx" ON "search_rels" USING btree ("people_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_checkbox_locales_locale_parent_id_unique" ON "forms_blocks_checkbox_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_checkbox_locales_parent_id_idx" ON "forms_blocks_checkbox_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_country_locales_locale_parent_id_unique" ON "forms_blocks_country_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_country_locales_parent_id_idx" ON "forms_blocks_country_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_email_locales_locale_parent_id_unique" ON "forms_blocks_email_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_email_locales_parent_id_idx" ON "forms_blocks_email_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_message_locales_locale_parent_id_unique" ON "forms_blocks_message_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_message_locales_parent_id_idx" ON "forms_blocks_message_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_number_locales_locale_parent_id_unique" ON "forms_blocks_number_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_number_locales_parent_id_idx" ON "forms_blocks_number_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_options_locales_locale_parent_id_unique" ON "forms_blocks_select_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_options_locales_parent_id_idx" ON "forms_blocks_select_options_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_select_locales_locale_parent_id_unique" ON "forms_blocks_select_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_select_locales_parent_id_idx" ON "forms_blocks_select_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_text_locales_locale_parent_id_unique" ON "forms_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_text_locales_parent_id_idx" ON "forms_blocks_text_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_textarea_locales_locale_parent_id_unique" ON "forms_blocks_textarea_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_textarea_locales_parent_id_idx" ON "forms_blocks_textarea_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_upload_mime_types_order_idx" ON "forms_blocks_upload_mime_types" USING btree ("_order");
  CREATE INDEX "forms_blocks_upload_mime_types_parent_id_idx" ON "forms_blocks_upload_mime_types" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_upload_order_idx" ON "forms_blocks_upload" USING btree ("_order");
  CREATE INDEX "forms_blocks_upload_parent_id_idx" ON "forms_blocks_upload" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_upload_path_idx" ON "forms_blocks_upload" USING btree ("_path");
  CREATE UNIQUE INDEX "forms_blocks_upload_locales_locale_parent_id_unique" ON "forms_blocks_upload_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_blocks_upload_locales_parent_id_idx" ON "forms_blocks_upload_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_emails_locales_locale_parent_id_unique" ON "forms_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_emails_locales_parent_id_idx" ON "forms_emails_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE UNIQUE INDEX "forms_locales_locale_parent_id_unique" ON "forms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "forms_locales_parent_id_idx" ON "forms_locales" USING btree ("_parent_id");
  CREATE INDEX "forms_rels_order_idx" ON "forms_rels" USING btree ("order");
  CREATE INDEX "forms_rels_parent_idx" ON "forms_rels" USING btree ("parent_id");
  CREATE INDEX "forms_rels_path_idx" ON "forms_rels" USING btree ("path");
  CREATE INDEX "forms_rels_pages_id_idx" ON "forms_rels" USING btree ("pages_id");
  CREATE INDEX "forms_rels_posts_id_idx" ON "forms_rels" USING btree ("posts_id");
  CREATE INDEX "forms_rels_events_id_idx" ON "forms_rels" USING btree ("events_id");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_submission_uploads_order_idx" ON "form_submissions_submission_uploads" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_uploads_parent_id_idx" ON "form_submissions_submission_uploads" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_event_idx" ON "form_submissions" USING btree ("event_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "form_submissions_rels_order_idx" ON "form_submissions_rels" USING btree ("order");
  CREATE INDEX "form_submissions_rels_parent_idx" ON "form_submissions_rels" USING btree ("parent_id");
  CREATE INDEX "form_submissions_rels_path_idx" ON "form_submissions_rels" USING btree ("path");
  CREATE INDEX "form_submissions_rels_application_files_id_idx" ON "form_submissions_rels" USING btree ("application_files_id");
  CREATE INDEX "exports_updated_at_idx" ON "exports" USING btree ("updated_at");
  CREATE INDEX "exports_created_at_idx" ON "exports" USING btree ("created_at");
  CREATE UNIQUE INDEX "exports_filename_idx" ON "exports" USING btree ("filename");
  CREATE INDEX "exports_texts_order_parent" ON "exports_texts" USING btree ("order","parent_id");
  CREATE INDEX "imports_updated_at_idx" ON "imports" USING btree ("updated_at");
  CREATE INDEX "imports_created_at_idx" ON "imports" USING btree ("created_at");
  CREATE UNIQUE INDEX "imports_filename_idx" ON "imports" USING btree ("filename");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_issues_id_idx" ON "payload_locked_documents_rels" USING btree ("issues_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_newsletters_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletters_id");
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_deliveries_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_deliveries_id");
  CREATE INDEX "payload_locked_documents_rels_application_files_id_idx" ON "payload_locked_documents_rels" USING btree ("application_files_id");
  CREATE INDEX "payload_locked_documents_rels_rate_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("rate_limits_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_current_issue_idx" ON "homepage" USING btree ("current_issue_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_posts_id_idx" ON "homepage_rels" USING btree ("posts_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_nav_items_locales_locale_parent_id_unique" ON "header_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_nav_items_locales_parent_id_idx" ON "header_nav_items_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_links_order_idx" ON "footer_links" USING btree ("_order");
  CREATE INDEX "footer_links_parent_id_idx" ON "footer_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_links_locales_locale_parent_id_unique" ON "footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_links_locales_parent_id_idx" ON "footer_links_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_locales_parent_id_idx" ON "footer_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_social_profiles_order_idx" ON "site_settings_social_profiles" USING btree ("_order");
  CREATE INDEX "site_settings_social_profiles_parent_id_idx" ON "site_settings_social_profiles" USING btree ("_parent_id");
  CREATE INDEX "site_settings_default_seo_default_seo_image_idx" ON "site_settings" USING btree ("default_seo_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_locales" CASCADE;
  DROP TABLE "_people_v" CASCADE;
  DROP TABLE "_people_v_locales" CASCADE;
  DROP TABLE "issues" CASCADE;
  DROP TABLE "issues_locales" CASCADE;
  DROP TABLE "issues_rels" CASCADE;
  DROP TABLE "_issues_v" CASCADE;
  DROP TABLE "_issues_v_locales" CASCADE;
  DROP TABLE "_issues_v_rels" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_locales" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "topics_locales" CASCADE;
  DROP TABLE "_topics_v" CASCADE;
  DROP TABLE "_topics_v_locales" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "team_members_locales" CASCADE;
  DROP TABLE "_team_members_v" CASCADE;
  DROP TABLE "_team_members_v_locales" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_team_grid_groups" CASCADE;
  DROP TABLE "pages_blocks_team_grid" CASCADE;
  DROP TABLE "pages_blocks_contact_form" CASCADE;
  DROP TABLE "pages_blocks_image_text" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_team_grid_groups" CASCADE;
  DROP TABLE "_pages_v_blocks_team_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_form" CASCADE;
  DROP TABLE "_pages_v_blocks_image_text" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "newsletters" CASCADE;
  DROP TABLE "newsletters_locales" CASCADE;
  DROP TABLE "newsletters_rels" CASCADE;
  DROP TABLE "_newsletters_v" CASCADE;
  DROP TABLE "_newsletters_v_locales" CASCADE;
  DROP TABLE "_newsletters_v_rels" CASCADE;
  DROP TABLE "subscribers_interests" CASCADE;
  DROP TABLE "subscribers" CASCADE;
  DROP TABLE "newsletter_deliveries" CASCADE;
  DROP TABLE "application_files" CASCADE;
  DROP TABLE "rate_limits" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_locales" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_checkbox_locales" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_country_locales" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_email_locales" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_message_locales" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_number_locales" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select_options_locales" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_select_locales" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_text_locales" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_blocks_textarea_locales" CASCADE;
  DROP TABLE "forms_blocks_upload_mime_types" CASCADE;
  DROP TABLE "forms_blocks_upload" CASCADE;
  DROP TABLE "forms_blocks_upload_locales" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms_emails_locales" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "forms_locales" CASCADE;
  DROP TABLE "forms_rels" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions_submission_uploads" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "form_submissions_rels" CASCADE;
  DROP TABLE "exports" CASCADE;
  DROP TABLE "exports_texts" CASCADE;
  DROP TABLE "imports" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header_nav_items_locales" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_links" CASCADE;
  DROP TABLE "footer_links_locales" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "site_settings_social_profiles" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_posts_type";
  DROP TYPE "public"."enum_posts_original_language";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_type";
  DROP TYPE "public"."enum__posts_v_version_original_language";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_people_status";
  DROP TYPE "public"."enum__people_v_version_status";
  DROP TYPE "public"."enum__people_v_published_locale";
  DROP TYPE "public"."enum_issues_format";
  DROP TYPE "public"."enum_issues_status";
  DROP TYPE "public"."enum__issues_v_version_format";
  DROP TYPE "public"."enum__issues_v_version_status";
  DROP TYPE "public"."enum__issues_v_published_locale";
  DROP TYPE "public"."enum_events_language";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_language";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum__events_v_published_locale";
  DROP TYPE "public"."enum_topics_status";
  DROP TYPE "public"."enum__topics_v_version_status";
  DROP TYPE "public"."enum__topics_v_published_locale";
  DROP TYPE "public"."enum_team_members_group";
  DROP TYPE "public"."enum_team_members_status";
  DROP TYPE "public"."enum__team_members_v_version_group";
  DROP TYPE "public"."enum__team_members_v_version_status";
  DROP TYPE "public"."enum__team_members_v_published_locale";
  DROP TYPE "public"."enum_pages_blocks_team_grid_groups";
  DROP TYPE "public"."enum_pages_blocks_image_text_image_position";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_team_grid_groups";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_image_position";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_newsletters_audience";
  DROP TYPE "public"."enum_newsletters_status";
  DROP TYPE "public"."enum__newsletters_v_version_audience";
  DROP TYPE "public"."enum__newsletters_v_version_status";
  DROP TYPE "public"."enum_subscribers_interests";
  DROP TYPE "public"."enum_subscribers_locale";
  DROP TYPE "public"."enum_subscribers_status";
  DROP TYPE "public"."enum_subscribers_source";
  DROP TYPE "public"."enum_newsletter_deliveries_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_forms_blocks_upload_upload_collection";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_forms_redirect_type";
  DROP TYPE "public"."enum_exports_format";
  DROP TYPE "public"."enum_exports_sort_order";
  DROP TYPE "public"."enum_exports_locale";
  DROP TYPE "public"."enum_exports_drafts";
  DROP TYPE "public"."enum_imports_import_mode";
  DROP TYPE "public"."enum_imports_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_footer_social_links_platform";
  DROP TYPE "public"."enum_site_settings_social_profiles_platform";`)
}
