import { Router } from "express";
import { getEditorId, requireAuth, requireEditor } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth, requireEditor);

// Create an issue (volume number and issue number) for a journal
router.post("/add", async (req, res) => {
    const { journalId, volumeNumber, issueNumber } = req.body;
    const editorId = getEditorId(req);

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
        const journal = await prisma.journal.findFirst({
            where: { id: journalId, assignedEditorId: editorId },
        });

        if (!journal) {
            res.status(404).json({ error: "Journal not found" });
            return;
        }

        const issue = await prisma.issue.create({
            data: {
                volumeNumber,
                issueNumber,
                journalId,
                assignedEditorId: editorId,
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
    const editorId = getEditorId(req);

    if (!Number.isInteger(journalId) || journalId <= 0) {
        res.status(400).json({ error: "Invalid journal ID" });
        return;
    }

    try {
        const journal = await prisma.journal.findFirst({
            where: { id: journalId, assignedEditorId: editorId },
            select: { id: true },
        });
        if (!journal) {
            res.status(404).json({ error: "Journal not found" });
            return;
        }

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
    const editorId = getEditorId(req);

    if (!Number.isInteger(issueId) || issueId <= 0) {
        res.status(400).json({ error: "Invalid issue ID" });
        return;
    }

    try {
        const issue = await prisma.issue.findFirst({
            where: {
                id: issueId,
                journal: { assignedEditorId: editorId },
            },
        });

        if (!issue) {
            res.status(404).json({ error: "Issue not found" });
            return;
        }

        await prisma.issue.delete({ where: { id: issueId } });
      
        const assignmentCount = await prisma.reviewAssignment.count({
            where: { paper: { issueId } }
        });

        if (assignmentCount > 0) {
            res.status(409).json({ error: "Issue cannot be deleted because reviewers have been assigned to its papers" });
            return;
        }

        await prisma.$transaction([
            prisma.paper.deleteMany({ where: { issueId } }),
            prisma.issue.delete({ where: { id: issueId } })
        ]);
        
        res.status(200).json({ message: "Issue deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete issue" });
    }
});

export default router;