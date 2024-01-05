/*
  Warnings:

  - You are about to drop the column `username` on the `Contact` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "unique_contact_username";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "username";

-- CreateIndex
CREATE INDEX "unique_user_contact_pair" ON "Contact"("userId", "contactId");
