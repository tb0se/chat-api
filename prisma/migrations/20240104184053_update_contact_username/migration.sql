/*
  Warnings:

  - You are about to drop the column `nickname` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `username` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "unique_contact_name";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "nickname",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "unique_contact_username" ON "Contact"("userId", "username");
