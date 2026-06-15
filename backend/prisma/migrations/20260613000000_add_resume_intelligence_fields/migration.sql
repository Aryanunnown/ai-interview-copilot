ALTER TABLE "Resume"
ADD COLUMN "candidateSummary" TEXT,
ADD COLUMN "strengths" JSONB,
ADD COLUMN "growthAreas" JSONB,
ADD COLUMN "recommendedRoles" JSONB,
ADD COLUMN "companies" JSONB,
ADD COLUMN "roles" JSONB,
ADD COLUMN "parsedProfile" JSONB;
