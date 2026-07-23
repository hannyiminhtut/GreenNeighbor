CREATE TABLE IF NOT EXISTS "waste_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"status" varchar(30) DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "latitude" double precision;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "longitude" double precision;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "case_id" integer;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "duplicate_confidence" real;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_case_id_waste_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."waste_cases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_duplicate_candidates_idx"
ON "reports" ("status", "created_at", "latitude", "longitude");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_case_id_idx" ON "reports" ("case_id");
