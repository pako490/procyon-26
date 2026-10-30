import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// criteria is the display string, highest rating first. ratings[0] is rating 1
function buildCriteria(ratings: string[]) {
    const [rating1, rating2, rating3, rating4, rating5] = ratings;
    return (
        `5 = ${rating5}; 4 = ${rating4}; 3 = ${rating3}; ` +
        `2 = ${rating2}; 1 = ${rating1}`
    );
}

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
    const trimmedRatings = (ratings as string[]).map((rating) => rating.trim());
    const [rating1, rating2, rating3, rating4, rating5] = trimmedRatings;

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

        const newQuestion = await prisma.question.create({
            data: {
                question: question.trim(),
                criteria: buildCriteria(trimmedRatings),
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

//================ Edit Question ================//
router.post("/edit/:id", async (req, res) => {
    const id = Number(req.params.id);

    // validate id
    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "Invalid question ID" });
        return;
    }

    const { question, ratings } = req.body;

    // validate fields
    if (
        typeof question !== "string" ||
        !question.trim() ||
        !Array.isArray(ratings) ||
        ratings.length !== 5 ||
        ratings.some((rating) => typeof rating !== "string" || !rating.trim())
    ) {
        res.status(400).json({ error: "Invalid question fields" });
        return;
    }

    const trimmedRatings = (ratings as string[]).map((rating) => rating.trim());
    const [rating1, rating2, rating3, rating4, rating5] = trimmedRatings;

    try {
        // find question if exists
        const existingQuestion = await prisma.question.findUnique({
            where: { id },
            include: { section: { include: { rubric: true } } },
        });

        if (!existingQuestion) {
            res.status(404).json({ error: "Question not found" });
            return;
        }

        if (existingQuestion.section.rubric.publishDate) {
            res.status(403).json({ error: "Published rubrics cannot be edited" });
            return;
        }

        // criteria and the five ratings are always updated together
        const updatedQuestion = await prisma.question.update({
            where: { id },
            data: {
                question: question.trim(),
                criteria: buildCriteria(trimmedRatings),
                rating1Description: rating1,
                rating2Description: rating2,
                rating3Description: rating3,
                rating4Description: rating4,
                rating5Description: rating5,
            },
        });

        res.json(updatedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update question" });
    }
});

export default router;
