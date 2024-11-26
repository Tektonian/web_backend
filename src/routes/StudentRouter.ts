import express from "express";
import {
    getStudentById,
    createStudent,
} from "../controllers/StudentController";

const StudentRouter = express.Router();

StudentRouter.get("/:student_id", getStudentById);
StudentRouter.post("/", createStudent);

export default StudentRouter;
