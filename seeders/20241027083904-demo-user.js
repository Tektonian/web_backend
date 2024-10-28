"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert("Corporation", [
            {
                corp_id: 1,
                corp_name: "OSUNG",
                nationality: "kr",
                corp_num: 123,
            },
        ]);

        await queryInterface.bulkInsert("Organization", [
            {
                orgn_id: 1,
                orgn_code: 123,
                nationality: "kr",
                full_name: "Ilgong",
            },
        ]);

        await queryInterface.bulkInsert("User", [
            {
                username: "test0",
                email: "test0@test.com",
                email_verified: new Date(),
            },
            {
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
            {
                username: "corp",
                email: "corp@gmail.com",
                created_at: new Date(),
                email_verified: new Date(),
            },
            {
                username: "orgn",
                email: "orgn@gmail.com",
                created_at: new Date(),
                email_verified: new Date(),
            },
        ]);
        const users = await queryInterface.sequelize.query(
            "select user_id, username, email from User",
        );
        const consumers = users[0].map((val, idx) => {
            return {
                user_id: val.user_id,
                consumer_type: "normal",
                consumer_email: val.email,
                phone_number: "",
            };
        });
        const corp = users[0].reduce((prev, curr, idx, arr) => {
            if (!arr[idx].email.startsWith("corp")) return prev;

            return {
                user_id: arr[idx].user_id,
                orgn_id: 1,
                consumer_type: "corp",
                consumer_email: arr[idx].email,
                phone_number: "",
                consumer_verified: new Date(),
            };
        }, []);

        const orgz = users[0].reduce((prev, curr, idx, arr) => {
            if (!arr[idx].email.startsWith("orgn")) return prev;

            return {
                user_id: arr[idx].user_id,
                corp_id: 1,
                consumer_type: "orgn",
                consumer_email: arr[idx].email,
                phone_number: "",
                consumer_verified: new Date(),
            };
        }, []);
        consumers.push(corp);
        consumers.push(orgz);
        await queryInterface.bulkInsert("Consumer", consumers);
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */
        const corp_consumer = await queryInterface.sequelize.query(
            "select consumer_id from Consumer where corp_id = 1",
        );
        await queryInterface.bulkInsert("Request", [
            {
                request_id: 1,
                consumer_id: corp_consumer[0][0].consumer_id,
                title: "통역",
                reward_price: 20000,
                currency: "yen",
                content: "알바구함",
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Consumer", null, {});
        await queryInterface.bulkDelete("Organization", null, {});
        await queryInterface.bulkDelete("Corporation", null, {});
        await queryInterface.bulkDelete("Request", null, {});
        await queryInterface.bulkDelete("User", null, {});
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
