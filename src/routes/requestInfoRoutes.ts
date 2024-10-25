import express, { Request, Response } from "express";
import {
    createRequestInfo,
    getAllRequestInfo,
    getRequestInfoById,
    updateRequestInfo,
    deleteRequestInfo,
} from "../controllers/requestInfoController";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    await createRequestInfo(req, res);
});

router.get("/", async (req: Request, res: Response) => {
    await getAllRequestInfo(req, res);
});

router.get("/:id", async (req: Request, res: Response) => {
    await getRequestInfoById(req, res);
});

router.put("/:id", async (req: Request, res: Response) => {
    await updateRequestInfo(req, res);
});

router.delete("/:id", async (req: Request, res: Response) => {
    await deleteRequestInfo(req, res);
});

export default router;
