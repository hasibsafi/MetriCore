-- Rename admin flag from Intoku branding to MetriCore.
ALTER TABLE "User" RENAME COLUMN "isIntokuAdmin" TO "isMetriCoreAdmin";
