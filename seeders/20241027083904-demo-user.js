"use strict";

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
            apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
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
                // console.log("Meilisearch school", ret);
            });
        });
        Request.addHook("beforeBulkCreate", async (requests, option) => {
            const index = client.index("request");

            requests.map(async (val) => {
                const model = val.dataValues;
                const document = {
                    id: model.request_id,
                    consumer_id: model.consumer_id,
                    title: model.title,
                    reward_price: model.reward_price,
                    currency: model.currency,
                    content: model.content,
                    _geo: JSON.parse(JSON.stringify(model.address_coordinate)),
                };
                // console.log(document);
                let ret = await index.addDocuments([document], {
                    primaryKey: "id",
                });
                // console.log("Meailisearch", ret);
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
            // console.log("School ", row);
            await School.bulkCreate([
                {
                    school_id: i,
                    school_name: jp,
                    school_name_glb: JSON.stringify({ kr: kr, jp: jp, en: en }),
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
        }

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

        const test0User = await User.create({
            username: "test0",
            email: "test0@test.com",
            email_verified: new Date(),
            roles: '["admin"]',
        });
        const test1User = await User.create({
            username: "test1",
            email: "test1@test.com",
            email_verified: new Date(),
            roles: '["admin"]',
        });
        const kangUser = await User.create({
            username: "kang",
            email: "kang@gmail.com",
            created_at: new Date(),
            email_verified: new Date(),
            roles: '["student"]',
        });
        await User.create({
            username: "student_1_corp",
            email: "student@test.com",
            created_at: new Date(),
            email_verified: new Date(),
            roles: '["student"]',
        });

        await User.create({
            username: "corp_1_user",
            email: "corp@gmail.com",
            created_at: new Date(),
            email_verified: new Date(),
            roles: '["corp"]',
        });
        await User.create({
            username: "orgn_1_user",
            email: "orgn@gmail.com",
            created_at: new Date(),
            email_verified: new Date(),
            roles: '["orgn"]',
        });
        const corpUser = await User.findOne({
            where: { email: "corp@gmail.com" },
        });
        const studentUser = await User.findOne({
            where: { email: "student@test.com" },
        });
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

        console.log("tes", orgnUser.get({ plain: true }));
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
        console.log(schools[0]);

        const studentProfile = await Student.create({
            user_id: studentUser.user_id,
            name_glb: `{"kr": ${studentUser.username}}`,
            nationality: "kr",
            age: 32,
            email_verified: new Date(),
            phone_number: "01022222222",
            emergency_contact: "01044444444",
            gender: "male",
            image: "",
            has_car: 0,
        });
        const acaHis1 = await AcademicHistory.create({
            school_id: schools[0].school_id,
            student_id: studentProfile.student_id,
            degree: "학사",
            start_date: new Date(),
            end_date: new Date(),
            status: "졸업",
            faculty: "컴공",
            school_email: "",
            is_attending: 1,
        });

        const acaHis2 = await AcademicHistory.create({
            school_id: schools[1].school_id,
            student_id: studentProfile.student_id,
            degree: "석사",
            start_date: new Date(),
            end_date: new Date(),
            status: "재학중",
            faculty: "운영체제",
            school_email: "school@email.com",
            is_attending: true,
        });

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
        await queryInterface.bulkDelete("Request", null, {});
        await queryInterface.bulkDelete("School", null, {});
        await queryInterface.bulkDelete("Consumer", null, {});
        await queryInterface.bulkDelete("Student", null, {});
        await queryInterface.bulkDelete("User", null, {});
        await queryInterface.bulkDelete("Organization", null, {});
        await queryInterface.bulkDelete("Corporation", null, {});
        await queryInterface.bulkDelete("AcademicHistory", null, {});
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
