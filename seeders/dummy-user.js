"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const db = require("../models");
        const User = db.sequelize.models.User;

        const userData = [
            {
                username: "test0",
                email: "test0@test.com",
                email_verified: new Date(),
                nationality: "KO",
                working_country: "KO",
                roles: ["admin", "normal"],
            },
            {
                username: "test1",
                email: "test1@test.com",
                nationality: "KO",
                working_country: "KO",
                email_verified: new Date(),
                roles: ["admin", "normal"],
            },
            {
                username: "kang",
                email: "kang@test.com",
                nationality: "KO",
                working_country: "KO",
                email_verified: new Date(),
                roles: ["student", "normal"],
            },
            {
                username: "corp_1_user",
                email: "corp@test.com",
                nationality: "KO",
                working_country: "KO",
                email_verified: new Date(),
                roles: ["corp", "normal"],
            },
            {
                username: "orgn_1_user",
                email: "orgn@test.com",
                nationality: "KO",
                working_country: "KO",
                email_verified: new Date(),
                roles: ["orgn", "normal"],
            },
        ];

        for (let i = 0; i < 30; i++) {
            const country = ["KO", "JP"].at(Math.floor(Math.random() * 2));
            const workingCountry = ["KO", "JP"].filter((val) => val !== country).at(0);
            userData.push({
                username: `student_${i}`,
                email: `student${i}@test.com`,
                email_verified: new Date(),
                nationality: country,
                working_country: workingCountry,
                roles: ["normal", "student"],
            });
        }
        for (let i = 0; i < 5; i++) {
            const country = ["KO", "JP"].at(Math.floor(Math.random() * 2));
            userData.push({
                username: `orgn_${i}_user`,
                email: `orgn${i}@test.com`,
                email_verified: new Date(),
                nationality: country,
                working_country: country,
                roles: ["normal", "orgn"],
            });
            userData.push({
                username: `corp_${i}_user`,
                email: `corp${i}@test.com`,
                email_verified: new Date(),
                nationality: country,
                working_country: country,
                roles: ["normal", "corp"],
            });
        }
        await User.bulkCreate(userData);

        return;
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("AcademicHistory", null, {});
        await queryInterface.bulkDelete("ExamHistory", null, {});
        await queryInterface.bulkDelete("Student", null, {});
        await queryInterface.bulkDelete("Request", null, {});
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
