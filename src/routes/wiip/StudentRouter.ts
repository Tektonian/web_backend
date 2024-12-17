import express, { Request, Response } from "express";
import {
    getStudentFullProfileByStudentId,
    getStudentByUserId,
    getInstReviewOfStudentByStudentId,
    createUnVerifiedStudentIdentity,
} from "../../controllers/wiip/StudentController";
import { getRequestByRequestId } from "../../controllers/wiip/RequestController";
import { Corporation } from "../../models/rdbms/Corporation";

import { APISpec, APIType } from "api_spec";
import logger from "../../utils/logger";

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

StudentRouter.get("/:student_id" satisfies keyof APISpec.StudentAPISpec, (async (req, res) => {
    const { student_id } = req.params;
    const roles: string[] | null = res.session?.user?.roles ?? null;
    // TODO: add response type
    let ret: APIType.StudentType.ResGetStudentProfile = {
        profile: undefined,
        review: [],
    };

    if (!student_id) {
        res.json(ret);
        return;
    }

    const studentFullProfile = (await getStudentFullProfileByStudentId(Number(student_id)))?.get({ plain: true });

    if (studentFullProfile === undefined) {
        res.json(ret);
        return;
    }

    ret.profile = {
        name_glb: studentFullProfile.name_glb,
        nationality: studentFullProfile.nationality,
        birth_date: new Date(studentFullProfile.birth_date),
        phone_number: studentFullProfile.phone_number,
        emergency_contact: studentFullProfile.emergency_contact,
        email_verified: studentFullProfile.email_verified,
        gender: Number(studentFullProfile.gender),
        image: studentFullProfile.image ?? "",
        has_car: studentFullProfile.has_car,
        keyword_list: studentFullProfile.keyword_list,
        academic_history: studentFullProfile.academic ?? [],
        exam_history: studentFullProfile.language ?? [],
    };
    if (roles !== null && (roles.includes("corp") || roles.includes("orgn"))) {
        const reviews = await getInstReviewOfStudentByStudentId(Number(student_id));

        await Promise.all(
            reviews.map(async (model) => {
                const review = model.get({ plain: true });
                const request = (await getRequestByRequestId(review.request_id))?.get({ plain: true });
                if (!review || !request) return;
                let logo_image = "";
                if (request.corp_id !== undefined) {
                    logo_image =
                        (
                            await Corporation.findOne({
                                where: {
                                    corp_id: request.corp_id,
                                },
                            })
                        )?.get("logo_image", { plain: true }) ?? "";
                }
                ret.review.push({
                    ...review,
                    request: {
                        request_id: request.request_id,
                        title: request.title,
                        reward_price: request.reward_price,
                        currency: request.currency,
                        address: request.address ?? "",
                        start_date: request.start_date ?? "",
                        logo_image: logo_image,
                    },
                });
            }),
        );
    }

    res.json(ret);
}) as APISpec.StudentAPISpec["/:student_id"]["get"]["__handler"]);

export default StudentRouter;
