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
    const { title } = req.body;
  
    if (
        typeof title !== "string" ||
        !title.trim()
    ) {
        res.status(400).json({ error: "A rubric title is required" });
        return;
    }
  
    try {
        const rubric = await prisma.rubric.create({
            data: {
                title: title.trim(),
            },
        });
  
        res.status(201).json(rubric);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create rubric" });
    }
});

// Edit a rubric
app.post("/api/rubrics/:id", async (req, res) => {
    const id = Number(req.params.id);

    // validate id
    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "Invalid rubric ID" });
        return;
    }

    const {
        title,
        lowQualThreshold,
        highQualThreshold,
    } = req.body;

    // validate fields
    if (
        (title !== undefined &&
            (typeof title !== "string" || !title.trim())) ||
        (lowQualThreshold !== undefined &&
            !Number.isInteger(lowQualThreshold)) ||
        (highQualThreshold !== undefined &&
            !Number.isInteger(highQualThreshold))
    ) {
        res.status(400).json({ error: "Invalid rubric fields" });
        return;
    }

    // return if no fields are provided
    if (
        title === undefined &&
        lowQualThreshold === undefined &&
        highQualThreshold === undefined
    ) {
        res.status(400).json({ error: "No fields provided to update" });
        return;
    }

    try {
        // find rubric if exists
        const existingRubric = await prisma.rubric.findUnique({
            where: { id },
        });

        if (!existingRubric) {
            res.status(404).json({ error: "Rubric not found" });
            return;
        }

        // update existing rubric
        const updatedRubric = await prisma.rubric.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: title.trim() }),
                ...(lowQualThreshold !== undefined && { lowQualThreshold }),
                ...(highQualThreshold !== undefined && { highQualThreshold }),
            },
        });

        res.status(200).json(updatedRubric);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update rubric" });
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