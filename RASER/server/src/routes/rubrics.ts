import { Router } from "express";
import { getDesignerId, requireDesigner, requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
// ensures every route needs a signed-in designer
router.use(requireAuth, requireDesigner);

const rubricSectionHeadings = [
    "Introduction",
    "Materials and Sourcing",
    "Methodology and Reproducibility",
    "Replication, risk of bias and Statistics",
    "Reporting and Transparency",
];

//================ Create Rubric (just title)================//
router.post("/create", async (req, res) => {
    const { title } = req.body;
    const designerId = getDesignerId(req);

    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "A rubric title is required" });
        return;
    }

    try {
        const rubric = await prisma.rubric.create({
            data: {
                title: title.trim(),
                assignedDesignerId: designerId,
                sections: {
                    create: rubricSectionHeadings.map((heading) => ({ heading })),
                },
            },
        });

        res.status(201).json(rubric);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create rubric" });
    }
});

//================ Edit Rubric (thresholds, title) ================//
router.post("/edit/:id", async (req, res) => {
    const id = Number(req.params.id);
    const designerId = getDesignerId(req);

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
            lowQualThreshold !== null &&
            !Number.isInteger(lowQualThreshold)) ||
        (highQualThreshold !== undefined &&
            highQualThreshold !== null &&
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

        if (existingRubric.assignedDesignerId !== designerId) {
            res.status(403).json({ error: "Only the rubric's designer can edit it" });
            return;
        }

        if (existingRubric.publishDate) {
            res.status(403).json({ error: "Published rubrics cannot be edited" });
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


//================ Delete Rubric ================//
router.delete("/delete/:id", async (req, res) => {
    const id = Number(req.params.id);
    const designerId = getDesignerId(req);

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

        if (rubric.assignedDesignerId !== designerId) {
            res.status(403).json({ error: "Only the rubric's designer can delete it" });
            return;
        }
        if (rubric.publishDate) {
            res.status(403).json({ error: "Published rubrics cannot be deleted" });
            return;
        }

        const sections = await prisma.section.findMany({
            where: { assignedRubricId: id },
            select: { id: true },
        });

        const sectionIds = sections.map((section) => section.id);

        // Delete all questions associated with the sections
        await prisma.question.deleteMany({
            where: { assignedSectionId: { in: sectionIds } },
        });

        // Delete all sections associated with the rubric
        await prisma.section.deleteMany({
            where: { assignedRubricId: id },
        });

        // Delete the rubric itself
        await prisma.rubric.delete({
            where: { id },
        });

        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete rubric" });
    }
});


//================ LIST Published RUBRICS ================//
// doesn't need to be scoped by designer (all designers can see all published rubrics)
router.get("/list", async (req, res) => {

    try {
        const rubrics = await prisma.rubric.findMany({
            where: {
                publishDate: {
                    not: null
                }
            },
            include: {
                sections: {
                    include: {
                        questions: { orderBy: { id: "asc" } }
                    }
                }
            }
        });

        return res.status(200).json(rubrics);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to retrieve rubrics"});

    }
});


//================ Your RUBRICS================//
// Open up a published single rubric
// doesn't need to be scoped by designer (all designers can see all published rubrics)
router.get("/list/:id", async (req, res) => {

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid rubric ID" });
    }

    try {
        const rubric = await prisma.rubric.findUnique({
            where: { id },
            include: {
                sections: {
                    include: {
                        questions: { orderBy: { id: "asc" } }
                    },
                    orderBy: { id: "asc" },
                }
            }
        });
        if (!rubric) {
            return res.status(404).json({ error: "Rubric not found" });
        }
        if (!rubric.publishDate) {
            return res.status(404).json({ error: "Published rubric not found" });
        }
        return res.status(200).json(rubric);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to retrieve rubric"});
    }
});

//================ Publish Rubric ================//
router.patch("/publish/:id", async(req, res) => {
    const id = Number(req.params.id);
    const designerId = getDesignerId(req);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid rubric ID" });
    }

    try {
        const existingRubric = await prisma.rubric.findUnique({ where: { id } });
        if (!existingRubric) {
            return res.status(404).json({ error: "Rubric not found" });
        }
        if (existingRubric.assignedDesignerId !== designerId) {
            return res.status(403).json({ error: "Only the rubric's designer can publish it" });
        }
        if (existingRubric.publishDate) {
            return res.status(403).json({ error: "Rubric is already published" });
        }

        const rubric = await prisma.rubric.update({
            where: { id },
            data: {
                publishDate: new Date() //automatically gets the current date
            }
        })

        return res.status(200).json(rubric)
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "failed to publish rubric"});
    }
});

//================ Deprecate Rubric ================//
router.patch("/deprecate/:id", async(req, res) => {

    const id = Number(req.params.id);
    const designerId = getDesignerId(req);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid rubric ID" });
    }


    try {
        const existingRubric = await prisma.rubric.findUnique({ where: { id } });
        if (!existingRubric) {
            return res.status(404).json({ error: "Rubric not found" });
        }
        if (!existingRubric.publishDate) {
            return res.status(400).json({
                error: "Only published rubrics can be deprecated",
            });
        }
    
        if (existingRubric.assignedDesignerId !== designerId) {
            return res.status(403).json({ error: "Only the rubric's designer can deprecate it" });
        }

        const rubric = await prisma.rubric.update({
            where: {id},
            data: {
                deprecationDate: new Date() //TODO: would we rather have this be like some equation that is X weeks from publish date?
            }
        })

        return res.status(200).json(rubric);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "failed to deprecate rubric"})

    }
})

//================ View Published Rubric ================//
router.get("/view/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid rubric ID" });
    }

    try {
        const rubric = await prisma.rubric.findUnique({
            where: { id },
            include: {
                sections: {
                    include: {
                        questions: { 
                            orderBy: { id: "asc" } 
                        }
                    },
                    orderBy: { id: "asc" },
                }
            }
        });

        if (!rubric) {
            return res.status(404).json({ error: "Rubric not found" });
        }

        // only allow viewing of published rubrics
        if (!rubric.publishDate) {
            return res.status(403).json({ error: "Rubric has not been published" });
        }

        return res.status(200).json(rubric);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to retrieve rubric"});
    }
});


//================ Get All Rubrics (published and unpublished) ================//
// includes that designer's rubrics and published rubrics (that all designers can see)
router.get("/all", async (req, res) => {
    const designerId = getDesignerId(req);
    try {
        const rubrics = await prisma.rubric.findMany({
            where: {
                OR: [
                    { assignedDesignerId: designerId, publishDate: null },
                    { publishDate: { not: null } },
                ],
            },
            orderBy: {
                id: "asc"
            }
        });

        return res.status(200).json(rubrics);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to retrieve rubrics"
        });
    }
});

//================ Get MY Rubrics ================//
router.get("/your", async (req, res) => {
    const designerId = getDesignerId(req);

    try {
        const rubrics = await prisma.rubric.findMany({
            where: {
                assignedDesignerId: designerId,
                publishDate: null,
            },
            orderBy: {
                id: "asc"
            }
        })

        return res.status(200).json(rubrics);
    } catch(error) {
        return res.status(500).json({error: "failed to retreive rubrics"});
    }
});

//================ Duplicate Rubric ================//
router.post("/duplicate/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "Invalid rubric ID" });
        return;
    }

    try {
        const source = await prisma.rubric.findUnique({
            where: { id },
            include: {
                sections: {
                    orderBy: { id: "asc" },
                    include: { questions: { orderBy: { id: "asc" } } },
                },
            },
        });

        if (!source) {
            res.status(404).json({ error: "Rubric not found" });
            return;
        }

        // One nested write = one transaction: all of the copy is created, or none of it.
        // Copy starts as a clean draft.
        const copy = await prisma.rubric.create({
            data: {
                title: `${source.title} (Copy)`,
                assignedDesignerId: source.assignedDesignerId,
                lowQualThreshold: source.lowQualThreshold,
                highQualThreshold: source.highQualThreshold,
                maxScoreComputed: source.maxScoreComputed,
                sampleURL: source.sampleURL,
                sections: {
                    create: source.sections.map((section) => ({
                        heading: section.heading,
                        questions: {
                            create: section.questions.map((q) => ({
                                question: q.question,
                                criteria: q.criteria,
                                rating1Description: q.rating1Description,
                                rating2Description: q.rating2Description,
                                rating3Description: q.rating3Description,
                                rating4Description: q.rating4Description,
                                rating5Description: q.rating5Description,
                            })),
                        },
                    })),
                },
            },
        });

        res.status(201).json(copy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to duplicate rubric" });
    }
});


//================ Get A Rubric for Editing ================//
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const designerId = getDesignerId(req);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid rubric ID" });
    }

    try {
        const rubric = await prisma.rubric.findUnique({
            where: { id },
            include: {
                sections: {
                    include: { questions: { orderBy: { id: "asc" } } },
                    orderBy: { id: "asc" },
                },
            },
        });

        if (!rubric) {
            return res.status(404).json({ error: "Rubric not found" });
        }
        if (!rubric.publishDate && rubric.assignedDesignerId !== designerId) {
            return res.status(404).json({ error: "Rubric not found" });
        }

        return res.status(200).json(rubric);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to retrieve rubric" });
    }
});

export default router;
