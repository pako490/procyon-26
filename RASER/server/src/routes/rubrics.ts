import express from "express"
import { prisma } from "../lib/prisma.js";

const app = express()

// Retrieve rubrics
app.get("/api/rubrics", async (_req, res) => {
    try {
        const rubrics = await prisma.rubric.findMany();
        res.json(rubrics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch rubrics" });
    }
});
  
// Create a new rubric
app.post("/api/rubrics", async (req, res) => {
    const { assignedDesignerId, 
            title,
            maxScoreComputed,
            lowQualThreshold,
            highQualThreshold,
            sampleURL
        } = req.body;
  
    if (
        !Number.isInteger(assignedDesignerId) ||
        typeof title !== "string" ||
        !title.trim() ||
        !Number.isInteger(maxScoreComputed) ||
        !Number.isInteger(lowQualThreshold) ||
        !Number.isInteger(highQualThreshold) ||
        typeof sampleURL !== "string" ||
        !sampleURL.trim()
    ) {
        res.status(400).json({ error: "Missing or invalid required rubric fields" });
        return;
    }
  
    try {
        const rubric = await prisma.rubric.create({
            data: {
                assignedDesignerId,
                title: title.trim(),
                maxScoreComputed,
                lowQualThreshold,
                highQualThreshold,
                sampleURL: sampleURL.trim(),
            },
        });
  
        res.status(201).json(rubric);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create rubric" });
    }
});

// Delete a rubric
app.delete("/api/rubrics/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "Invalid rubric ID" });
        return;
    }

    try {
        const rubric = await prisma.rubric.findUnique({
            where: { id },
        });
        if (!rubric) {
            res.status(404).json({ error: "Rubric not found" });
            return;
        }
        const deletedRubric = await prisma.rubric.delete({
            where: { id },
        });
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete rubric" });
    }
}); 

export default app;