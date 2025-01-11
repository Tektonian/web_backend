"use strict";

const DepartMentList = [
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
        const db = require("../models");
        const School = db.sequelize.models.School;
        const User = db.sequelize.models.User;
        const Student = db.sequelize.models.Student;
        const AcademicHistory = db.sequelize.models.AcademicHistory;

        const allUsers = await User.findAll();

        const studentUsers = [];

        allUsers.forEach((user, idx) => {
            if (user.username.startsWith("student")) {
                studentUsers.push({
                    student_id: idx,
                    user_id: user.user_id,
                    name_glb: { KR: user.username, JP: user.username },
                    birth_date: new Date(),
                    email_verified: new Date(),
                    phone_number: "01022222222",
                    emergency_contact: "01044444444",
                    keyword_list: [],
                    gender: 0,
                    image: "https://picsum.photos/200/300",
                    has_car: 0,
                });
            }
        });

        await Student.bulkCreate(studentUsers);

        const allSchools = await School.findAll();

        const allStudentData = await Student.findAll();
        const academicHistories = [];

        allStudentData.forEach((student, idx) => {
            academicHistories.push({
                school_id: allSchools[idx].school_id,
                student_id: student.student_id,
                degree: ["학사", "석사", "박사"].at(Math.floor(Math.random() * 3)),
                start_date: new Date(),
                end_date: new Date(),
                status: [0, 1, 2].at(Math.floor(Math.random() * 3)),
                faculty: DepartMentList.at(Math.floor(Math.random() * DepartMentList.length)),
                school_email: `email_of_${idx}th_school@test.com`,
                is_attending: true,
            });
        });

        await AcademicHistory.bulkCreate(academicHistories);

        return;
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("AcademicHistory", null, {});
        await queryInterface.bulkDelete("Student", null, {});
        await queryInterface.bulkDelete("User", { username: { [Sequelize.Op.startsWith]: "student" } }, {});
        await queryInterface.bulkDelete("School");
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
