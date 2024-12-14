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
            apiKey: "3c8f293c82e4352eed1bef7a87613bcd663130104a189e9d1ac76e05c0fcba04",
        });

        const db = require("../models");
        const School = db.sequelize.models.School;
        const User = db.sequelize.models.User;

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
            try {
                await School.bulkCreate([
                    {
                        school_id: i,
                        school_name: jp,
                        school_name_glb: {
                            kr: kr,
                            jp: jp,
                            en: en,
                        },
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
                client.index("school-name-jp").addDocuments({
                    school_id: i,
                    school_name: jp,
                    school_name_glb: {
                        kr: kr,
                        jp: jp,
                        en: en,
                    },
                    country_code: "jp",
                });
            } catch (error) {
                console.log("Validation Error in School.bulkcreate", error);
            }
        }

        const userData = [
            {
                username: "test0",
                email: "test0@test.com",
                email_verified: new Date(),
                roles: ["admin", "normal"],
            },
            {
                username: "test1",
                email: "test1@test.com",
                email_verified: new Date(),
                roles: ["admin", "normal"],
            },
            {
                username: "kang",
                email: "kang@test.com",
                email_verified: new Date(),
                roles: ["student", "normal"],
            },
            {
                username: "corp_1_user",
                email: "corp@test.com",
                email_verified: new Date(),
                roles: ["corp", "normal"],
            },
            {
                username: "orgn_1_user",
                email: "orgn@test.com",
                email_verified: new Date(),
                roles: ["orgn", "normal"],
            },
        ];

        for (let i = 0; i < 100; i++) {
            userData.push({
                username: `student_${i}`,
                email: `student${i}@test.com`,
                email_verified: new Date(),
                roles: ["student", "normal"],
            });
        }
        await User.bulkCreate(userData);

        return;
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("AcademicHistory", null, {});
        await queryInterface.bulkDelete("Request", null, {});
        await queryInterface.bulkDelete("Student", null, {});
        await queryInterface.bulkDelete("Consumer", null, {});
        await queryInterface.bulkDelete("User", null, {});
        await queryInterface.bulkDelete("AcademicHistory", null, {});
        await queryInterface.bulkDelete("Organization", null, {});
        await queryInterface.bulkDelete("School", null, {});
        await queryInterface.bulkDelete("Corporation", null, {});

        // Reset useless data
        await queryInterface.bulkDelete("VerificationToken", null, {});
        await queryInterface.bulkDelete("Account", null, {});
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
