import express, { Request, Response } from "express";

/**
 * Controller
 */
import {
    getStudentByUserId,
    createUnVerifiedStudentIdentity,
    updateStudentProfileByUserId,
    getStudentByStudentId,
} from "../../controllers/wiip/StudentController";
import { getUserByStudentId } from "../../controllers/wiip/UserController";
/**
 * Utils, types, etc..
 */
import * as Errors from "../../errors";
import { APISpec } from "api_spec";
import { StudentSchema } from "api_spec/zod";
import { ValidateSchema } from "../../utils/validation";
import logger from "../../utils/logger";
import { filterSessionByRBAC } from "../../middleware/auth.middleware";
import { pick } from "es-toolkit";
const StudentRouter = express.Router();

StudentRouter.post(
    "/" satisfies keyof APISpec.StudentAPISpec,
    // Check session
    filterSessionByRBAC([]),
    (async (req, res) => {
        const profileData = ValidateSchema(StudentSchema.ReqCreateStudentProfileSchema, req.body);
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

        const ret = await createUnVerifiedStudentIdentity(sessionUser.id, profileData);

        if (ret === undefined) {
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.status(201).json({
                message: "Student profile created successfully",
                student: ret,
            });
        }
    }) as APISpec.StudentAPISpec["/"]["post"]["handler"],
);

// TODO: Response 타입 정확한지 확인 필요
StudentRouter.get("/:student_id" satisfies keyof APISpec.StudentAPISpec, (async (req, res) => {
    const { student_id } = req.params;
    const sessionUser = res.session?.user;

    if (!student_id) {
        throw new Errors.ServiceExceptionBase(`User sent wrong student id: ${student_id}`);
    }

    const studentProfile = (await getStudentByStudentId(Number(student_id)))?.get({ plain: true });
    if (!studentProfile) {
        throw new Errors.ServiceExceptionBase(`User sent wrong student id: ${student_id}`);
    }

    const studentUser = (await getUserByStudentId(Number(student_id)))?.get({ plain: true });

    if (!studentUser) {
        throw new Errors.ServiceErrorBase(`Something went wrong, Student user should exist ${student_id}`);
    }

    res.json(
        pick(
            studentProfile,
            sessionUser?.id.equals(studentProfile.user_id) !== true
                ? ["name_glb", "keyword_list", "image", "student_id", "has_car"]
                : [
                      "name_glb",
                      "keyword_list",
                      "image",
                      "student_id",
                      "has_car",
                      "gender",
                      "birth_date",
                      "phone_number",
                      "emergency_contact",
                  ],
        ),
    );
}) as APISpec.StudentAPISpec["/:student_id"]["get"]["__handler"]);

StudentRouter.post(
    "/update" satisfies keyof APISpec.StudentAPISpec,
    // Only student user
    filterSessionByRBAC(["student"]),
    (async (req, res) => {
        logger.info("START-Update student profile");
        const sessionUser = res.session!.user;

        const updateCount = await updateStudentProfileByUserId(sessionUser.id, req.body);

        if (updateCount[0] === 0) {
            throw new Errors.ServiceExceptionBase("Failed to update user profile");
        }

        res.status(200).json(req.body);
        logger.info("START-Update student profile");
    }) as APISpec.StudentAPISpec["/update"]["post"]["handler"],
);

export default StudentRouter;
