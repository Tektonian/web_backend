"use strict";

const department_list = [
    "간호학과",
    "건설방재공학과",
    "건축학과",
    "건축공학과",
    "게임학과",
    "경영정보학과",
    "경영학과",
    "경제학과",
    "경찰학과",
    "관광학과",
    "교육학과",
    "국어교육과",
    "국어국문학과",
    "군사학과",
    "기계공학과",
    "기독교학과",
    "노어노문학과",
    "농업경제학과",
    "농업자원경제학과",
    "독어독문학과",
    "동물자원학과",
    "문예창작학과",
    "문헌정보학과",
    "문화재보존학과",
    "물리치료학과",
    "물리학과",
    "법학과",
    "북한학과",
    "불교학과",
    "불어불문학과",
    "사학과",
    "사회학과",
    "사회복지학과",
    "산업공학과",
    "생명과학과",
    "세무학과",
    "서어서문학과",
    "섬유공학과",
    "소방학과",
    "수산생명의학과",
    "수의학과",
    "수학과",
    "심리학과",
    "식품영양학과",
    "신학과",
    "안전공학과",
    "약학과",
    "언어학과",
    "에너지공학과",
    "연극학과",
    "영상학과",
    "영어영문학과",
    "유아교육과",
    "윤리교육과",
    "의학과",
    "인공지능학과",
    "일반사회교육과",
    "일어일문학과",
    "임상병리학과",
    "자유전공학부",
    "제과제빵과",
    "재료공학과",
    "전기전자공학과",
    "정보보안학과",
    "정보통신공학과",
    "정치외교학과",
    "조경학과",
    "조리과학과",
    "중어중문학과",
    "지리학과",
    "지리교육과",
    "지적학과",
    "철도공학과",
    "철학과",
    "치의학과",
    "치위생학과",
    "커뮤니케이션학과",
    "컴퓨터공학과",
    "통계학과",
    "특수교육과",
    "한문학과",
    "한약학과",
    "한의학과",
    "항공운항학과",
    "행정학과",
    "화학공학과",
    "화학과",
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const DataTypes = require("sequelize").DataTypes;
        const fs = require("fs");
        const JpSchoolDataest = await fs.readFileSync(
            "../../school_dataset/assets/jp/school_list.csv",
            "utf-8",
        );
        const rows = JpSchoolDataest.split("\n");
        const MeiliSearch = require("meilisearch").MeiliSearch;
        const client = new MeiliSearch({
            host: "http://127.0.0.1:7700",
            apiKey: "3c8f293c82e4352eed1bef7a87613bcd663130104a189e9d1ac76e05c0fcba04",
        });

        const db = require("../models");
        const School = db.sequelize.models.School;
        const Request = db.sequelize.models.Request;
        const User = db.sequelize.models.User;
        const Student = db.sequelize.models.Student;
        const Corporation = db.sequelize.models.Corporation;
        const Organization = db.sequelize.models.Organization;
        const Consumer = db.sequelize.models.Consumer;
        const AcademicHistory = db.sequelize.models.AcademicHistory;
        const StudentWithCurrentSchool =
            db.sequelize.models.studentwithcurrentschool;

        School.addHook("beforeBulkCreate", async (schools, option) => {
            const index = client.index("school");
            schools.map(async (val) => {
                const model = val.dataValues;
                const document = {
                    id: model.school_id,
                    school_name: model.school_name,
                    school_name_glb: model.school_name_glb,
                    country_code: model.country_code,
                    _geo: JSON.parse(JSON.stringify(model.coordinate)),
                };
                let ret = await index.addDocuments([document], {
                    primaryKey: "id",
                });
                console.log("Meilisearch school", ret);
            });
        });
        Request.addHook("beforeBulkCreate", async (requests, option) => {
            const index = client.index("request");

            requests.map(async (val) => {
                const model = val.dataValues;
                const coordinate = JSON.parse(
                    JSON.stringify(model.address_coordinate),
                ).coordinates;
                const document = {
                    id: model.request_id,
                    consumer_id: model.consumer_id,
                    title: model.title,
                    reward_price: model.reward_price,
                    currency: model.currency,
                    content: model.content,
                    _geo: { lat: coordinate[0], lng: coordinate[1] },
                };
                console.log(document);
                let ret = await index.addDocuments([document], {
                    primaryKey: "id",
                });
                console.log("Meailisearch", ret);
            });
        });

        for (let i = 0; i < rows.length; i++) {
            if (i === 0) {
                continue;
            }
            const row = rows[i].split(",");
            const kr = row.at(-2) ?? null;
            const jp = row[8] ?? null;
            const en = row.at(-1) ?? null;
            const lng = row[1];
            const lat = row[2];
            const address = row[9];
            const coordinate = {
                type: "Point",
                coordinates: [Number(lat), Number(lng)],
            };
            console.log("School ", row);
            try {
                await School.bulkCreate([
                    {
                        school_id: i,
                        school_name: jp,
                        school_name_glb: JSON.stringify({
                            kr: kr,
                            jp: jp,
                            en: en,
                        }),
                        country_code: "jp",
                        address: address,
                        coordinate: coordinate,
                        /*queryInterface.sequelize.fn(
                        "ST_GeomFromText",
                        `POINT(${lng} ${lat})`,
                    ),
                    */
                    },
                ]);
            } catch (error) {
                console.log(
                    "Validation Error in School.bulkcreate",
                    error.errors,
                );
            }
        }

        try {
            await Corporation.bulkCreate([
                {
                    corp_id: 1,
                    corp_name: "SaSUNG",
                    nationality: "kr",
                    corp_num: 123,
                },
                {
                    corp_id: 2,
                    corp_name: "Onasonic",
                    nationality: "jp",
                    corp_num: 54,
                },
                {
                    corp_id: 3,
                    corp_name: "Nonedai",
                    nationality: "kr",
                    corp_num: 928,
                },
                {
                    corp_id: 4,
                    corp_name: "Yuyota",
                    nationality: "jp",
                    corp_num: 83,
                },
            ]);
        } catch (error) {
            console.log(
                "Validation Error in Corporation.bulkCreate",
                error.errors,
            );
        }

        try {
            await Organization.bulkCreate([
                {
                    orgn_id: 1,
                    orgn_code: 123,
                    nationality: "kr",
                    full_name: "Ilgong",
                },
                {
                    orgn_id: 2,
                    orgn_code: 523,
                    nationality: "jp",
                    full_name: "Japan emb",
                },
                {
                    orgn_id: 3,
                    orgn_code: 928,
                    nationality: "kr",
                    full_name: "Hankook Kyouone",
                },
                {
                    orgn_id: 4,
                    orgn_code: 99,
                    nationality: "jp",
                    full_name: "Ilbon Kyouone",
                },
            ]);
        } catch (error) {
            console.log("Validation Error in Org.BulkCreate", error.errors);
        }

        const test0User = await User.create({
            username: "test0",
            email: "test0@test.com",
            email_verified: new Date(),
            roles: ["admin"],
        });
        const test1User = await User.create({
            username: "test1",
            email: "test1@test.com",
            email_verified: new Date(),
            roles: ["admin"],
        });
        const kangUser = await User.create({
            username: "kang",
            email: "kang@gmail.com",
            email_verified: new Date(),
            roles: ["student"],
        });
        const bulkStudents = [];
        for (let i = 0; i < 100; i++) {
            bulkStudents.push({
                username: `student_${i}`,
                email: `student${i}@test.com`,
                email_verified: new Date(),
                roles: ["student"],
            });
        }
        await User.bulkCreate(bulkStudents);
        await User.create({
            username: "student_1_corp",
            email: "student@test.com",
            email_verified: new Date(),
            roles: ["student"],
        });

        await User.create({
            username: "corp_1_user",
            email: "corp@gmail.com",
            email_verified: new Date(),
            roles: ["corp"],
        });
        await User.create({
            username: "orgn_1_user",
            email: "orgn@gmail.com",
            email_verified: new Date(),
            roles: ["orgn"],
        });
        const corpUser = await User.findOne({
            where: { email: "corp@gmail.com" },
        });
        const studentUsers = await User.findAll();

        const orgnUser = await User.findOne({
            where: { email: "orgn@gmail.com" },
        });

        const users = await queryInterface.sequelize.query(
            "select user_id, username, email from User;",
        );

        // Create normal consumer first
        const consumers = users[0].map((val, idx) => {
            return {
                user_id: val.user_id,
                consumer_type: "normal",
                consumer_email: val.email,
                phone_number: "",
            };
        });

        const orgnConsumer = await Consumer.create({
            user_id: orgnUser.user_id,
            orgn_id: 1,
            consumer_type: "orgn",
            consumer_email: orgnUser.email,
            phone_number: "01033333333",
            consumer_verified: new Date(),
        });

        const corpConsumer = await Consumer.create({
            user_id: corpUser.user_id,
            corp_id: 1,
            consumer_type: "corp",
            consumer_email: corpUser.email,
            phone_number: "01011111111",
            consumer_verified: new Date(),
        });

        await Request.bulkCreate([
            {
                request_id: 1,
                consumer_id: corpConsumer.consumer_id,
                title: "오사카 통역 알바",
                reward_price: 21400,
                currency: "yen",
                content: "알바구함",
                address: "오사카 요도야바시 역",
                address_coordinate: {
                    type: "Point",
                    coordinates: [34.6967451, 135.5011539],
                },
            },
            {
                request_id: 2,
                consumer_id: orgnConsumer.consumer_id,
                title: "도쿄 통역 알바",
                reward_price: 19400,
                currency: "yen",
                content: "알바구함",
                address: "신주쿠 워싱턴 호텔",
                address_coordinate: {
                    type: "Point",
                    coordinates: [35.6896103, 139.6991946],
                },
            },
            {
                request_id: 3,
                consumer_id: corpConsumer.consumer_id,
                title: "한국 서울 통역 알바",
                reward_price: 20000,
                currency: "won",
                content: "알바구함",
                address: `서울 코엑스`,
                address_coordinate: {
                    type: "Point",
                    coordinates: [37.5116828, 127.059151],
                },
            },
        ]);

        const schools = await School.findAll();

        const studentProfiles = await Promise.all(
            studentUsers.map(async (user, idx) => {
                return await Student.create({
                    user_id: user.user_id,
                    name_glb: `{"kr": ${user.username}}`,
                    nationality: "kr",
                    age: 32,
                    email_verified: new Date(),
                    phone_number: "01022222222",
                    emergency_contact: "01044444444",
                    gender: "male",
                    image: "",
                    has_car: 0,
                });
            }),
        );

        const studentDatas = await Student.findAll();

        await Promise.all(
            studentDatas.map(async (student, idx) => {
                console.log(student);
                await AcademicHistory.create({
                    school_id: schools[idx].school_id,
                    student_id: student.student_id,
                    degree: ["학사", "석사", "박사"].at(
                        Math.floor(Math.random() * 3),
                    ),
                    start_date: new Date(),
                    end_date: new Date(),
                    status: [
                        "재학중",
                        "휴학",
                        "중퇴",
                        "자퇴",
                        "수료",
                        "졸업",
                    ].at(Math.floor(Math.random() * 6)),
                    faculty: department_list.at(
                        Math.floor(Math.random() * department_list.length),
                    ),
                    school_email: `email_of_${idx}th_school@email.com`,
                    is_attending: true,
                });
            }),
        );

        const studentAll = await StudentWithCurrentSchool.findAll();
        console.log("A::", studentAll);

        studentAll.map(async (student) => {
            const index = client.index("studentwithcurrentschool");
            const model = student.get({ plain: true });
            const coordinate = JSON.parse(
                JSON.stringify(model.coordinate),
            ).coordinates;
            const document = {
                id: model.id,
                student_id: model.student_id,
                name_glb: model.name_glb,
                nationality: model.nationality,
                age: model.age,
                student_phone_number: model.student_phone_number,
                gender: model.gender,
                degree: model.degree,
                faculty: model.faculty,
                school_id: model.school_id,
                school_country_code: model.country_code,
                school_name: model.school_name,
                school_name_glb: model.school_name_glb,
                school_address: model.address,
                country_code: model.country_code,
                _geo: { lat: coordinate[0], lng: coordinate[1] },
            };
            let ret = await index.addDocuments([document], {
                primaryKey: "id",
            });
        });

        await client
            .index("studentwithcurrentschool")
            .updateFilterableAttributes(["_geo"]);

        const sleep = (ms) => {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        };
        await sleep(5000);
        return;
    },

    async down(queryInterface, Sequelize) {
        const MeiliSearch = require("meilisearch").MeiliSearch;
        const client = new MeiliSearch({
            host: "http://127.0.0.1:7700",
            apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
        });
        client.deleteIndex("school");
        client.deleteIndex("request");
        client.deleteIndex("studentwithcurrentschool");
        await queryInterface.bulkDelete("Request", null, {});
        await queryInterface.bulkDelete("Consumer", null, {});
        await queryInterface.bulkDelete("AcademicHistory", null, {});
        await queryInterface.bulkDelete("Student", null, {});
        await queryInterface.bulkDelete("AcademicHistory", null, {});
        await queryInterface.bulkDelete("User", null, {});
        await queryInterface.bulkDelete("Organization", null, {});
        await queryInterface.bulkDelete("School", null, {});
        await queryInterface.bulkDelete("Corporation", null, {});
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
