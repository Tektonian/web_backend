"use strict";

const parseCsv = (filepath) => {
    const fs = require("fs");
    const dataset = fs.readFileSync(filepath, "utf-8").split("\n");

    const keys = dataset[0].split(",");
    const rows = dataset.slice(1, undefined);

    const dictList = [];

    for (let row of rows) {
        let dict = {};
        let items = row.split(",");
        items.forEach((item, idx) => (dict[keys[idx]] = item));
        dictList.push(dict);
    }

    return dictList;
};
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const parsedJpSchool = parseCsv("../../school_dataset/assets/jp/school_list.csv");
        const MeiliSearch = require("meilisearch").MeiliSearch;
        const client = new MeiliSearch({
            host: "http://127.0.0.1:7700",
            apiKey: process.env.MEILISEARCH_KEY,
        });

        const db = require("../models");
        const School = db.sequelize.models.School;
        let idx = 0;

        for (let school of parsedJpSchool) {
            try {
                await School.create({
                    school_id: idx,
                    school_name: school["JP"],
                    school_name_glb: { KO: school["KO"], JP: school["JP"], US: school["US"] },
                    country_code: "JP",
                    address: school["学校所在地"],
                    coordinate: {
                        type: "Point",
                        coordinates: [Number(school["lat"]), Number(school["lng"])],
                    },
                });
                client.index("school-name-jp").addDocuments({
                    school_id: idx,
                    school_name: school["JP"],
                    school_name_glb: {
                        KO: school["KO"],
                        JP: school["JP"],
                        US: school["US"],
                    },
                    country_code: "JP",
                });
            } catch (error) {
                console.log("Validation Error in School.bulkcreate", error);
            }
            idx += 1;
        }
        const parsedKoSchool = await parseCsv("../../school_dataset/assets/kr/school_list.csv");

        for (let school of parsedKoSchool) {
            try {
                await School.create({
                    school_id: idx,
                    school_name: school["KO"],
                    school_name_glb: { KO: school["KO"], JP: school["JP"], US: school["US"] },
                    country_code: "KO",
                    address: school["주소"],
                    coordinate: {
                        type: "Point",
                        coordinates: [Number(school["lat"]), Number(school["lng"])],
                    },
                });
                client.index("school-name-ko").addDocuments({
                    school_id: idx,
                    school_name: school["KO"],
                    school_name_glb: {
                        KO: school["KO"],
                        JP: school["JP"],
                        US: school["US"],
                    },
                    country_code: "KO",
                });
            } catch (error) {
                console.log("Validation Error in School.bulkcreate", error);
            }
            idx += 1;
        }

        return;
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("School", null, {});
    },
};
