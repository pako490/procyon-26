import {Router} from "express"
import { prisma } from "../lib/prisma.js";

const router = Router()

// // Retrieve rubrics
// app.get("/api/rubrics", async (_req, res) => {
//     try {
//         const rubrics = await prisma.rubric.findMany();
//         res.json(rubrics);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to fetch rubrics" });
//     }
// });
  
// Create a new rubric
// TODO: add section creation implementation
router.post("/create", async (req, res) => {
    const { assignedDesignerId, 
            title,
            lowQualThreshold,
            highQualThreshold,
        } = req.body;
  
    if (
        !Number.isInteger(assignedDesignerId) ||
        typeof title !== "string" ||
        !title.trim() ||
        !Number.isInteger(lowQualThreshold) ||
        !Number.isInteger(highQualThreshold)
    ) {
        res.status(400).json({ error: "Missing or invalid required rubric fields" });
        return;
    }
  
    try {
        const rubric = await prisma.rubric.create({
            data: {
                assignedDesignerId,
                title: title.trim(),
                lowQualThreshold,
                highQualThreshold,
            },
        });
  
        res.status(201).json(rubric);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create rubric" });
    }
});

// Delete a rubric
router.delete("/delete/:id", async (req, res) => {
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


//================LIST Published RUBRICS================//

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

router.get("/list/:id", async (req, res) => {
    
    const id = Number(req.params.id);

    try {
        const rubrics = await prisma.rubric.findMany({
            where: {id },
            include: {
                sections: {
                    include: {
                        questions: true
                    }
                }
            }
        });
        return res.status(200).json(rubrics)
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Failed to retrieve rubrics"});
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


//================ Get All Rubric ================//
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

export default router;