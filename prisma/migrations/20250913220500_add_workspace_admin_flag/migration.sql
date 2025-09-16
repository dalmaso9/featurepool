-- Add workspaceAdmin flag to distinguish first admin user
ALTER TABLE "User" ADD COLUMN     "workspaceAdmin" BOOLEAN NOT NULL DEFAULT false;

