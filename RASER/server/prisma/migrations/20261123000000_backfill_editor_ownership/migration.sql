-- Assign unowned journals and issues to the existing editor with the lowest user ID.
-- This preserves access after editor authorization is enabled.
UPDATE "Journal"
SET "assignedEditorId" = (
    SELECT "id"
    FROM "User"
    WHERE "role" = 'EDITOR'
    ORDER BY "id"
    LIMIT 1
)
WHERE "assignedEditorId" IS NULL;

UPDATE "Issue" AS issue
SET "assignedEditorId" = journal."assignedEditorId"
FROM "Journal" AS journal
WHERE issue."journalId" = journal."id"
  AND issue."assignedEditorId" IS NULL;
