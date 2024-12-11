import express, { Request, Response } from "express";
import {
    getStudentByStudentId,
    getInstReviewOfStudentByStudentId,
    createUnVerifiedStudentIdentity,
} from "../../controllers/wiip/StudentController";

const StudentRouter = express.Router();

StudentRouter.post("/", async (req: Request, res: Response) => {
    const sessionUser = res.session?.user ?? undefined;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }

    const ret = await createUnVerifiedStudentIdentity(sessionUser.id, req.body);

    if (ret === null) {
        res.status(500).json({ message: "Internal Server Error" });
    } else {
        res.status(201).json({
            message: "Student profile created successfully",
            student: ret,
        });
    }
});

StudentRouter.get("/:student_id", async (req: Request, res: Response) => {
    const student_id = req.params.student_id;
    const user = res.session?.user ?? null;
    const roles: string[] | null = user?.roles ?? null;
    // TODO: add response type
    const ret = {
        profile: "",
        review: "",
    };

    if (student_id === "") {
        res.json("");
        return;
    }

    const studentFullProfile = await getStudentByStudentId(Number(student_id));

    ret.profile = studentFullProfile.get({ plain: true });

    if (roles !== null && (roles.includes("corp") || roles.includes("orgn"))) {
        const reviewOfStudent = getInstReviewOfStudentByStudentId(
            Number(student_id),
        );

        ret.review = reviewOfStudent;
    } else {
        ret.review = "";
    }

    res.json(ret);
});

export default StudentRouter;
