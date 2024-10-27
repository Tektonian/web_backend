"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("User", [
            {
                user_id: 0x0,
                username: "test0",
                email: "test0@test.com",
                email_verified: new Date(),
            },
            {
                user_id: 0x1,
                username: "test1",
                email: "test1@test.com",
                email_verified: new Date(),
            },
            {
                username: "",
                email: "kang@gmail.com",
                created_at: new Date(),
                email_verified: new Date(),
            },
        ]);
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("User", null, {});
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
