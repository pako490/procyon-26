import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

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

    if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({ error: "A rubric title is required" });
        return;
    }

    try {
        const rubric = await prisma.rubric.create({
            data: {
                title: title.trim(),
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
router.post("/delete/:id", async (req, res) => {
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
                        questions: true
                    }
                }
            }
        });

        return res.status(200).json(rubrics);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to retreieve rubrics"});

    }
});


//================ Your RUBRICS================//
// Open up a published single rubric
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
                        questions: true
                    },
                    orderBy: { id: "asc" },
                }
            }
        });
        if (!rubric) {
            return res.status(404).json({ error: "Rubric not found" });
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

    try {
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

    try {
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


//================ Get All Rubrics (published and unpublished) ================//
router.get("/all", async (req, res) => {
    try {
        const rubrics = await prisma.rubric.findMany({
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
router.get("/your/:id", async (req, res) => {

    const id = Number(req.params.id);

    try {
        const rubrics = await prisma.rubric.findMany({
            where: {
                assignedDesignerId: id
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

//================ Get A Rubric for Editing ================//
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid rubric ID" });
    }

    try {
        const rubric = await prisma.rubric.findUnique({
            where: { id },
            include: {
                sections: {
                    include: { questions: true },
                    orderBy: { id: "asc" },
                },
            },
        });

        if (!rubric) {
            return res.status(404).json({ error: "Rubric not found" });
        }

        return res.status(200).json(rubric);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to retrieve rubric" });
    }
});

export default router;
