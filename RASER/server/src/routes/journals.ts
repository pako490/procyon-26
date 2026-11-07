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

export default router