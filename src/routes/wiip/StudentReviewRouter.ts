import express, { Request, Response } from "express";
import { StudentReview } from "../../models/rdbms/StudentReview";
import { Request as RequestModel } from "../../models/rdbms/Request";
import { Consumer } from "../../models/rdbms/Consumer";

const StudentReviewRouter = express.Router();

StudentReviewRouter.post("/", async (req: Request, res: Response) => {
    try {
        const { consumer_id, student_id, request_id, ...reviewData } = req.body;

        const request = await RequestModel.findOne({
            where: { request_id },
            attributes: ["student_id"],
        });

        const createdReview = await StudentReview.create({
            consumer_id,
            student_id,
            request_id,
            ...reviewData,
        });

        res.status(201).json({ success: true, review: createdReview });
    } catch (error) {
        console.error("Error creating student review:", error);
        res.status(500).json({ error: "Failed to create student review" });
    }
});

export default StudentReviewRouter;
