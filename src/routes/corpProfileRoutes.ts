import express, { Request, Response } from "express";
import {
    createCorpProfile,
    getAllCorpProfile,
    getCorpProfileById,
    updateCorpProfile,
    deleteCorpProfile,
} from "../controllers/corpProfileController";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    await createCorpProfile(req, res);
});

router.get("/", async (req: Request, res: Response) => {
    await getAllCorpProfile(req, res);
});

router.get("/:id", async (req: Request, res: Response) => {
    await getCorpProfileById(req, res);
});

router.put("/:id", async (req: Request, res: Response) => {
    await updateCorpProfile(req, res);
});

router.delete("/:id", async (req: Request, res: Response) => {
    await deleteCorpProfile(req, res);
});

export default router;
