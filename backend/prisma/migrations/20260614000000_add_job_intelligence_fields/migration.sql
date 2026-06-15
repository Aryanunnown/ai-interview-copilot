ALTER TABLE "JobDescription"
ADD COLUMN "jobTitle" TEXT,
ADD COLUMN "jobSummary" TEXT,
ADD COLUMN "requiredSkills" JSONB,
ADD COLUMN "preferredSkills" JSONB,
ADD COLUMN "requiredExperience" INTEGER,
ADD COLUMN "domains" JSONB,
ADD COLUMN "responsibilities" JSONB,
ADD COLUMN "keywords" JSONB,
ADD COLUMN "parsedProfile" JSONB,
ADD COLUMN "analysisSource" TEXT;
