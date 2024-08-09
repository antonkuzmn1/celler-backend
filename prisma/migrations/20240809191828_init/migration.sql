/*
  Warnings:

  - You are about to alter the column `updated` on the `Cell` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updated` on the `Column` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updated` on the `Group` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updated` on the `Row` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updated` on the `Table` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `updated` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `Cell` MODIFY `updated` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `Column` MODIFY `updated` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `ColumnGroup` ADD COLUMN `created` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `Group` MODIFY `updated` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `Row` MODIFY `updated` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `Table` MODIFY `updated` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `TableGroup` ADD COLUMN `created` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `User` MODIFY `updated` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `UserGroup` ADD COLUMN `created` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);
