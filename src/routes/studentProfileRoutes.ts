import express, { Request, Response } from "express";
import {
    createStudentProfile,
    getAllStudentProfile,
    getStudentProfileById,
    updateStudentProfile,
    deleteStudentProfile,
} from "../controllers/studentProfileController";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    await createStudentProfile(req, res);
});

router.get("/", async (req: Request, res: Response) => {
    await getAllStudentProfile(req, res);
});

router.get("/:id", async (req: Request, res: Response) => {
    await getStudentProfileById(req, res);
});

router.put("/:id", async (req: Request, res: Response) => {
    await updateStudentProfile(req, res);
});

router.delete("/:id", async (req: Request, res: Response) => {
    await deleteStudentProfile(req, res);
});

export default router;
