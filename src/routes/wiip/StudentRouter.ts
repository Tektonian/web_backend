import express, { Request, Response } from "express";
import {
    getStudentFullProfileByStudentId,
    getStudentByUserId,
    getInstReviewOfStudentByStudentId,
    createUnVerifiedStudentIdentity,
} from "../../controllers/wiip/StudentController";
import { getRequestByRequestId } from "../../controllers/wiip/RequestController";
import { Corporation } from "../../models/rdbms/Corporation";

import * as Errors from "../../errors";
import { APISpec } from "api_spec";
import logger from "../../utils/logger";
import { getUserByStudentId } from "../../controllers/UserController";

const StudentRouter = express.Router();

StudentRouter.post("/", async (req: Request, res: Response) => {
    const sessionUser = res.session?.user ?? undefined;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }

    const studentExist = (await getStudentByUserId(sessionUser.id as Buffer))?.get({ plain: true });

    if (studentExist !== undefined) {
        res.json("Illigal request. Student identity is already exist");
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

// TODO: Response 타입 정확한지 확인 필요
StudentRouter.get("/:student_id" satisfies keyof APISpec.StudentAPISpec, (async (req, res) => {
    const { student_id } = req.params;
    const sessionUser = res.session?.user;

    if (!student_id) {
        throw new Errors.ServiceExceptionBase(`User sent wrong student id: ${student_id}`);
    }

    const studentFullProfile = (await getStudentFullProfileByStudentId(Number(student_id)))?.get({ plain: true });
    if (!studentFullProfile) {
        throw new Errors.ServiceExceptionBase(`User sent wrong student id: ${student_id}`);
    }

    const studentUser = (await getUserByStudentId(Number(student_id)))?.get({ plain: true });

    if (!studentUser) {
        throw new Errors.ServiceErrorBase(`Something went wrong, Student user should exist ${student_id}`);
    }

    const contact = {
        phone_number: studentFullProfile.phone_number,
        emergency_contact: studentFullProfile.emergency_contact,
    };

    res.json({
        profile: {
            ...studentFullProfile,
            name_glb: studentFullProfile.name_glb as { KR: string },
            has_car: studentFullProfile.has_car as 0,
            gender: studentFullProfile.gender as 0,
            major: studentFullProfile.academic?.at(-1)?.faculty ?? "",
            nationality: studentUser.nationality as "KR",
            keyword_list: studentFullProfile.keyword_list as string[],
            academic_history: studentFullProfile.academic ?? [],
            // exam_history: studentFullProfile.language ?? [],
        },
        contact: sessionUser?.id.equals(studentUser.user_id as Buffer) ? contact : undefined,
    });
}) as APISpec.StudentAPISpec["/:student_id"]["get"]["__handler"]);

export default StudentRouter;
