import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

//================ Add Question ================//
router.post("/add", async (req, res) => {
    const { sectionId, question, ratings } = req.body;

    // validate fields
    if (
        !Number.isInteger(sectionId) ||
        sectionId <= 0 ||
        typeof question !== "string" ||
        !question.trim() ||
        !Array.isArray(ratings) ||
        ratings.length !== 5 ||
        ratings.some((rating) => typeof rating !== "string" || !rating.trim())
    ) {
        res.status(400).json({ error: "Invalid question fields" });
        return;
    }

    // ratings[0] is the description for a rating of 1, ratings[4] for a rating of 5
    const [rating1, rating2, rating3, rating4, rating5] = (ratings as string[]).map(
        (rating) => rating.trim(),
    );

    try {
        // find section if exists
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: { rubric: true },
        });

        if (!section) {
            res.status(404).json({ error: "Section not found" });
            return;
        }

        if (section.rubric.publishDate) {
            res.status(403).json({ error: "Published rubrics cannot be edited" });
            return;
        }

        // explanation is the display string, highest rating first
        const newQuestion = await prisma.question.create({
            data: {
                question: question.trim(),
                explanation:
                    `5 = ${rating5}; 4 = ${rating4}; 3 = ${rating3}; ` +
                    `2 = ${rating2}; 1 = ${rating1}`,
                rating1Description: rating1,
                rating2Description: rating2,
                rating3Description: rating3,
                rating4Description: rating4,
                rating5Description: rating5,
                assignedSectionId: sectionId,
            },
        });

        res.status(201).json(newQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add question" });
    }
});

export default router;
