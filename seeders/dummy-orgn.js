"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const db = require("../models");
        const Organization = db.sequelize.models.Organization;
        const Corporation = db.sequelize.models.Corporation;

        try {
            await Corporation.bulkCreate([
                {
                    corp_id: 1,
                    corp_name: "SaSUNG",
                    nationality: "kr",
                    corp_num: 123,
                    logo_image: "https://picsum.photos/id/111/200/300",
                },
                {
                    corp_id: 2,
                    corp_name: "Onasonic",
                    nationality: "jp",
                    corp_num: 54,
                    logo_image: "https://picsum.photos/id/222/200/300",
                },
                {
                    corp_id: 3,
                    corp_name: "Nonedai",
                    nationality: "kr",
                    corp_num: 928,
                    logo_image: "https://picsum.photos/id/237/200/300",
                },
                {
                    corp_id: 4,
                    corp_name: "Yuyota",
                    nationality: "jp",
                    corp_num: 83,
                    logo_image: "https://picsum.photos/id/123/200/300",
                },
            ]);
        } catch (error) {
            console.log("Validation Error in Corporation.bulkCreate", error);
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

        return;
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Organization", null, {});
        await queryInterface.bulkDelete("Corporation", null, {});

        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
