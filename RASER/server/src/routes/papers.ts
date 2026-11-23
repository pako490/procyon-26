import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// TODO: AUTH

// Add a paper to an issue for review
router.post("/add", async (req, res) => {
    const { issueId, title, authors } = req.body;

    if (!Number.isInteger(issueId) || issueId <= 0) {
        res.status(400).json({ error: "Invalid issue ID" });
        return;
    }

    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "A paper title is required" });
        return;
    }

    if (authors !== undefined && authors !== null && typeof authors !== "string") {
        res.status(400).json({ error: "Authors must be a string" });
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

        // status defaults to IN_REVIEW in the schema
        const paper = await prisma.paper.create({
            data: {
                issueId,
                title: title.trim(),
                authors: authors?.trim() || null
            }
        });

        res.status(201).json(paper);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add paper" });
    }
});

// Get all papers for an issue (includes how many reviewers are assigned)
router.get("/issue/:issueId", async (req, res) => {
    const issueId = Number(req.params.issueId);

    if (!Number.isInteger(issueId) || issueId <= 0) {
        res.status(400).json({ error: "Invalid issue ID" });
        return;
    }

    try {
        const papers = await prisma.paper.findMany({
            where: { issueId },
            orderBy: { id: "asc" },
            include: { _count: { select: { reviewAssignments: true } } }
        });

        res.status(200).json(
            papers.map(({ _count, ...paper }) => ({
                ...paper,
                reviewerCount: _count.reviewAssignments
            }))
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get papers" });
    }
});

// Withdraw a paper from review (only allowed while no reviewers are assigned)
router.post("/:id/withdraw", async (req, res) => {
    const paperId = Number(req.params.id);

    if (!Number.isInteger(paperId) || paperId <= 0) {
        res.status(400).json({ error: "Invalid paper ID" });
        return;
    }

    try {
        // The rules live in the WHERE clause so the check and the update happen
        // as one atomic statement (no gap for a reviewer to be assigned in between).
        const result = await prisma.paper.updateMany({
            where: {
                id: paperId,
                status: "IN_REVIEW",
                reviewAssignments: { none: {} }
            },
            data: { status: "WITHDRAWN" }
        });

        if (result.count === 1) {
            const paper = await prisma.paper.findUnique({ where: { id: paperId } });
            res.status(200).json(paper);
            return;
        }

        // Nothing was updated, so work out why in order to return a useful error
        const paper = await prisma.paper.findUnique({ where: { id: paperId } });

        if (!paper) {
            res.status(404).json({ error: "Paper not found" });
            return;
        }

        if (paper.status === "WITHDRAWN") {
            res.status(409).json({ error: "Paper has already been withdrawn" });
            return;
        }

        res.status(409).json({ error: "Paper cannot be withdrawn because reviewers have already been assigned" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to withdraw paper" });
    }
});

export default router;
