import express, { Request, Response } from "express";
import {
    getStudentByStudentId,
    getInstReviewOfStudentByStudentId,
    createUnVerifiedStudentIdentity,
} from "../../controllers/wiip/StudentController";
import { APISpec } from "api_spec";
import { fullstudentprofile } from "../../models/rdbms/fullstudentprofile";
import logger from "../../utils/logger";

const StudentRouter = express.Router();

StudentRouter.post("/", async (req: Request, res: Response) => {
    const sessionUser = res.session?.user ?? undefined;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }

    const ret = await createUnVerifiedStudentIdentity(sessionUser.id, req.body);

    if (ret === undefined) {
        res.status(500).json({ message: "Internal Server Error" });
    } else {
        res.status(201).json({
            message: "Student profile created successfully",
            student: ret,
        });
    }
});

StudentRouter.get(
    "/:student_id" satisfies keyof APISpec.StudentAPISpec,
    (async (req, res) => {
        const { student_id } = req.params;
        const user = res.session?.user ?? null;
        const roles: string[] | null = user?.roles ?? null;
        // TODO: add response type
        let ret: { profile: any; review: any } = {
            profile: undefined,
            review: undefined,
        };

        if (student_id === undefined) {
            res.json("");
            return;
        }

        const studentFullProfile = await getStudentByStudentId(
            Number(student_id),
        );

        if (studentFullProfile === null) {
            res.json("");
            return;
        }

        ret.profile = studentFullProfile.get({ plain: true });
        if (
            roles !== null &&
            (roles.includes("corp") || roles.includes("orgn"))
        ) {
            ret.review = await getInstReviewOfStudentByStudentId(
                Number(student_id),
            );
        }

        res.json(ret);
    }) as APISpec.StudentAPISpec["/:student_id"]["get"]["__handler"],
);

export default StudentRouter;
