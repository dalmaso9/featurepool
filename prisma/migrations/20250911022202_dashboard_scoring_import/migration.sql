/*
  Warnings:

  - You are about to drop the column `revenue` on the `CustomerCompany` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CustomerCompany" DROP COLUMN "revenue",
ADD COLUMN     "employees" INTEGER,
ADD COLUMN     "monthlyRevenue" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ScoringConfig" ADD COLUMN     "weightEmployees" INTEGER NOT NULL DEFAULT 0;
