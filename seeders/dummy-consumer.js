"use strict";

function randPickOne(ids) {
    return ids[Math.floor(Math.random() * ids.length)];
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const DataTypes = require("sequelize").DataTypes;

        const db = require("../models");
        const User = db.sequelize.models.User;
        const Consumer = db.sequelize.models.Consumer;
        const Corporation = db.sequelize.models.Corporation;
        const Organization = db.sequelize.models.Organization;

        const allCorporation = await Corporation.findAll();
        const allOrganization = await Organization.findAll();
        const allUsers = await User.findAll();
        const allConsumerData = [];

        let consumer_id = 1;
        allUsers.map((user) => {
            if (user.username.startsWith("corp")) {
                allConsumerData.push({
                    consumer_id: consumer_id++,
                    user_id: user.user_id,
                    corp_id: randPickOne(allCorporation).corp_id,
                    consumer_type: "corp",
                    consumer_email: user.email,
                    phone_number: "01011111111",
                    consumer_verified: new Date(),
                });
            } else if (user.username.startsWith("orgn")) {
                allConsumerData.push({
                    consumer_id: consumer_id++,
                    user_id: user.user_id,
                    orgn_id: randPickOne(allOrganization).orgn_id,
                    consumer_type: "orgn",
                    consumer_email: user.email,
                    phone_number: "01033333333",
                    consumer_verified: new Date(),
                });
            }

            // default consumer identity
            allConsumerData.push({
                consumer_id: consumer_id++,
                user_id: user.user_id,
                consumer_type: "normal",
                phone_number: "",
                consumer_email: user.email,
            });
        });

        await Consumer.bulkCreate(allConsumerData);
        return;
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Consumer", null, {});
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
