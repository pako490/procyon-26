import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// TODO: AUTH

// Register Journal
router.post("/register", async (req, res) => {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ error: "A journal name is required" });
        return;
    }

    try {
        const journal = await prisma.journal.create({
            data: { name: name.trim() },
        });
        res.status(201).json(journal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to register journal" });
    }
});

// Get all journals
router.get("/all", async (_req, res) => {
    try {
        const journals = await prisma.journal.findMany({
            orderBy: { id: "asc" },
        });
        res.status(200).json(journals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve journals" });
    }
});

// Show Journal Dashboard
router.get("/dashboard/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "Invalid journal ID" });
        return;
    }

    try {
        const journal = await prisma.journal.findUnique({ where: { id } });
        if (!journal) {
            res.status(404).json({ error: "Journal not found" });
            return;
        }
        res.status(200).json(journal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get journal dashboard" });
    }
});

// List published and assigned rubrics
router.get("/:id/rubrics", async (req, res) => {
    const journalId = Number(req.params.id);
    const view = req.query.view ?? "assigned";

    if (!Number.isInteger(journalId) || journalId <= 0) {
        res.status(400).json({ error: "Invalid journal ID" });
        return;
    }

    if (view !== "assigned" && view !== "published") {
        res.status(400).json({ error: "Invalid rubric view" });
        return;
    }

    try {
        const journal = await prisma.journal.findUnique({
            where: { id: journalId },
            select: { id: true },
        });
        if (!journal) {
            res.status(404).json({ error: "Journal not found" });
            return;
        }

        // find published rubrics
        const rubrics = await prisma.rubric.findMany({
            where: {
                publishDate: { not: null },
                // if looking for assigned rubrics, also filter for those where this journal's id is assigned
                ...(view === "assigned" && {
                    assignedJournalIds: { has: journalId },
                }),
            },
            orderBy: { id: "asc" },
            select: { id: true, title: true, publishDate: true, assignedJournalIds: true },
        });

        res.status(200).json(rubrics.map((rubric) => ({
            id: rubric.id,
            title: rubric.title,
            publishDate: rubric.publishDate,
            assignedToJournal: rubric.assignedJournalIds.includes(journalId),
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve journal rubrics" });
    }
});

// Assign a published rubric to a journal
router.post("/:id/assign-rubric/:rubricId", async (req, res) => {
    const journalId = Number(req.params.id);
    const rubricId = Number(req.params.rubricId);

    if (!Number.isInteger(journalId) || journalId <= 0) {
        res.status(400).json({ error: "Invalid journal ID" });
        return;
    }
    if (!Number.isInteger(rubricId) || rubricId <= 0) {
        res.status(400).json({ error: "Invalid rubric ID" });
        return;
    }

    try {
        const journal = await prisma.journal.findUnique({ where: { id: journalId } });
        if (!journal) {
            res.status(404).json({ error: "Journal not found" });
            return;
        }

        const rubric = await prisma.rubric.findUnique({ where: { id: rubricId } });
        if (!rubric) {
            res.status(404).json({ error: "Rubric not found" });
            return;
        }
        if (!rubric.publishDate) {
            res.status(403).json({ error: "Only published rubrics can be assigned" });
            return;
        }

        // append current journal id to the rubric's assignedJournalIds field
        // to show that this rubric is now assigned to this journal
        // rubrics might be used across multiple journals, so using an array and checking that it's not already assigned
        await prisma.$executeRaw`
            UPDATE "Rubric"
            SET "assignedJournalIds" = array_append("assignedJournalIds", ${journalId})
            WHERE "id" = ${rubricId}
              AND "publishDate" IS NOT NULL
              AND NOT (${journalId} = ANY("assignedJournalIds"))
        `;
        res.status(200).json({ journalId, rubricId, assigned: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to assign rubric to journal" });
    }
});

// Unassign a rubric from a journal
router.delete("/:id/unassign-rubric/:rubricId", async (req, res) => {
    const journalId = Number(req.params.id);
    const rubricId = Number(req.params.rubricId);

    if (!Number.isInteger(journalId) || journalId <= 0) {
        res.status(400).json({ error: "Invalid journal ID" });
        return;
    }
    if (!Number.isInteger(rubricId) || rubricId <= 0) {
        res.status(400).json({ error: "Invalid rubric ID" });
        return;
    }

    try {
        const journal = await prisma.journal.findUnique({ where: { id: journalId } });
        if (!journal) {
            res.status(404).json({ error: "Journal not found" });
            return;
        }

        const rubric = await prisma.rubric.findUnique({ where: { id: rubricId } });
        if (!rubric) {
            res.status(404).json({ error: "Rubric not found" });
            return;
        }

        // remove the journal id from that rubric's assignedJournalIds
        await prisma.$executeRaw`
            UPDATE "Rubric"
            SET "assignedJournalIds" = array_remove("assignedJournalIds", ${journalId})
            WHERE "id" = ${rubricId}
        `;
        res.status(200).json({ journalId, rubricId, assigned: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to unassign rubric from journal" });
    }
});

export default router;