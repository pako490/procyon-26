import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Create an issue (volume number and issue number) for a journal
router.post("/add", async (req, res) => {
    const { journalId, volumeNumber, issueNumber } = req.body;

    if (!Number.isInteger(journalId) || journalId <= 0) {
        res.status(400).json({ error: "Invalid journal ID" });
        return;
    }

    if (
        !Number.isInteger(volumeNumber) || volumeNumber <= 0 ||
        !Number.isInteger(issueNumber) || issueNumber <= 0
    ) {
        res.status(400).json({ error: "Volume and issue number must be positive whole numbers" });
        return;
    }

    try {
        const journal = await prisma.journal.findUnique({ 
            where: { id: journalId } 
        });

        if (!journal) {
            res.status(404).json({ error: "Journal not found" });
            return;
        }

        const issue = await prisma.issue.create({
            data: {
                volumeNumber,
                issueNumber,
                journalId
            }
        });

        res.status(201).json(issue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create issue" });
    }
});

// Get all issues for a journal
router.get("/:id", async (req, res) => {
    const journalId = Number(req.params.id);

    if (!Number.isInteger(journalId) || journalId <= 0) {
        res.status(400).json({ error: "Invalid journal ID" });
        return;
    }

    try {
        const issues = await prisma.issue.findMany({
            where: { journalId },
            orderBy: [{ volumeNumber: "asc" }, { issueNumber: "asc" }]
        });

        res.status(200).json(issues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get issues" });
    }
});

// Delete an issue
router.delete("/:id", async (req, res) => {
    const issueId = Number(req.params.id);

    if (!Number.isInteger(issueId) || issueId <= 0) {
        res.status(400).json({ error: "Invalid issue ID" });
        return;
    }

    try {
        const issue = await prisma.issue.findUnique({ 
            where: { id: issueId } 
        });

        if (!issue) {
            res.status(404).json({ error: "Issue not found" });
            return;
        }

        await prisma.issue.delete({ 
            where: { id: issueId } 
        });
        res.status(200).json({ message: "Issue deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete issue" });
    }
});

export default router;