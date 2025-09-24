/*
  Warnings:

  - A unique constraint covering the columns `[role,key]` on the table `memories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "memories_role_key_idx";

-- CreateIndex
CREATE UNIQUE INDEX "memories_role_key_key" ON "memories"("role", "key");
