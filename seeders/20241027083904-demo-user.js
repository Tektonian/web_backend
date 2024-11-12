"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const DataTypes = require("sequelize").DataTypes;

        const MeiliSearch = require("meilisearch").MeiliSearch;
        const client = new MeiliSearch({
            host: "http://127.0.0.1:7700",
            apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
        });
        const school = queryInterface.sequelize.define(
            "School",
            {
                school_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                school_name_glb: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                nationality: {
                    type: DataTypes.STRING(4),
                    allowNull: true,
                },
                coordinate: {
                    type: "MULTIPOINT",
                    allowNull: true,
                    comment: "School can have multiple campus\n",
                },
            },
            {
                tableName: "School",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "school_id" }],
                    },
                ],
            },
        );

        const request = queryInterface.sequelize.define(
            "Request",
            {
                request_id: {
                    autoIncrement: true,
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                consumer_id: {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Consumer",
                        key: "consumer_id",
                    },
                },
                title: {
                    type: Sequelize.DataTypes.STRING(255),
                    allowNull: false,
                },
                subtitle: {
                    type: Sequelize.DataTypes.JSON,
                    allowNull: true,
                },
                head_count: {
                    type: Sequelize.DataTypes.TINYINT.UNSIGNED,
                    allowNull: true,
                },
                reward_price: {
                    type: Sequelize.DataTypes.INTEGER,
                    allowNull: false,
                },
                currency: {
                    type: Sequelize.DataTypes.STRING(7),
                    allowNull: false,
                },
                content: {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                },
                are_needed: {
                    type: Sequelize.DataTypes.JSON,
                    allowNull: true,
                },
                are_required: {
                    type: Sequelize.DataTypes.JSON,
                    allowNull: true,
                },
                start_date: {
                    type: Sequelize.DataTypes.DATEONLY,
                    allowNull: true,
                },
                end_date: {
                    type: Sequelize.DataTypes.DATEONLY,
                    allowNull: true,
                },
                address: {
                    type: Sequelize.DataTypes.STRING(255),
                    allowNull: true,
                },
                address_cordinate: {
                    type: "POINT",
                    allowNull: true,
                },
                provide_food: {
                    type: Sequelize.DataTypes.BLOB,
                    allowNull: true,
                },
                provide_trans_exp: {
                    type: Sequelize.DataTypes.BLOB,
                    allowNull: true,
                },
                prep_material: {
                    type: Sequelize.DataTypes.JSON,
                    allowNull: true,
                },
                status: {
                    type: Sequelize.DataTypes.TINYINT,
                    allowNull: true,
                    comment:
                        "There could be various statuses of a request.\n\nFor example\n\nPosted: consumer wrote a request but not paid\nPaid: consumer paid for a request\nOutdated: No provider(s) contracted with a consumer\nContracted: provider(s) contracted with a consumer\nFinished: work has been done!\nFailed: Contraction didn’t work properly\n",
                },
            },
            {
                tableName: "Request",
                imestamps: false,
                createdAt: false,
                updatedAt: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "request_id" }],
                    },
                    {
                        name: "consumer_id_idx",
                        using: "BTREE",
                        fields: [{ name: "consumer_id" }],
                    },
                ],
            },
        );
        school.addHook("beforeBulkCreate", async (requests, option) => {
            const index = client.index("school");

            requests.map(async (val) => {
                const model = val.dataValues;
                const document = {
                    id: model.school_id,
                };
                let ret = await index.addDocuments([document], {
                    primaryKey: "id",
                });
                console.log("Meilisearch school", ret);
            });
        });
        request.addHook("beforeBulkCreate", async (requests, option) => {
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
                    _geo: JSON.parse(JSON.stringify(model.address)),
                };
                console.log(document);
                let ret = await index.addDocuments([document], {
                    primaryKey: "id",
                });
                console.log("Meailisearch", ret);
            });
        });

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
                roles: '["admin"]',
            },
            {
                username: "test1",
                email: "test1@test.com",
                email_verified: new Date(),
                roles: '["admin"]',
            },
            {
                username: "kang",
                email: "kang@gmail.com",
                created_at: new Date(),
                email_verified: new Date(),
                roles: '["student"]',
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
            "select user_id, username, email from User;",
        );
        console.log(users[0][0].user_id.toString("hex"));
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
            "select consumer_id from Consumer where corp_id=1;",
        );

        for (let i = 1; i < 100; i++) {
            let lat = Math.floor(Math.random() * 80000) + 10000;
            let lng = Math.floor(Math.random() * 80000) + 10000;
            await request.bulkCreate([
                {
                    request_id: 2 * i,
                    consumer_id: corp_consumer[0][0].consumer_id,
                    title: "오사카 통역 알바",
                    reward_price: 20000,
                    currency: "yen",
                    content: "알바구함",
                    address: `{ lat: 37.${lat}, lng: 127.${lng} }`,
                    address_cordinate: queryInterface.sequelize.fn(
                        "ST_GeomFromText",
                        "POINT(37.584896 127.0317056)",
                    ),
                },
            ]);
            await request.bulkCreate([
                {
                    request_id: 2 * i + 1,
                    consumer_id: corp_consumer[0][0].consumer_id,
                    title: "한국 서울 통역 알바",
                    reward_price: 20000,
                    currency: "won",
                    content: "알바구함",
                    address: `{ lat: 37.${lat}, lng: 127.${lng} }`,
                    address_cordinate: queryInterface.sequelize.fn(
                        "ST_GeomFromText",
                        "POINT(37.584896 127.0317056)",
                    ),
                },
            ]);
        }
        const fs = require("fs");
        const delimeter = ",";
        const schoolDataset = fs
            .readFileSync("./meilisearch/school_list.orig.csv", "utf-8")
            .split("\r\n");

        const keys = schoolDataset[0].split(delimeter);

        const sleep = (ms) => {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        };
        await sleep(5000);
        return;
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("User", null, {});
        await queryInterface.bulkDelete("Student", null, {});
        await queryInterface.bulkDelete("Organization", null, {});
        await queryInterface.bulkDelete("Corporation", null, {});
        await queryInterface.bulkDelete("Consumer", null, {});
        await queryInterface.bulkDelete("Request", null, {});
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
