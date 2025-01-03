"use strict";

// https://www.latlong.net/country
// prettier-ignore
const JapanFamousPlacd = [
{name: "Tokyo, Japan" ,coordinate:[35.652832, 139.839478]},
{name: "Tokyo Tower, Tokyo, Japan" ,coordinate:[35.658581, 139.745438]},
{name: "Kōtō, Tokyo, Japan" ,coordinate:[35.672855, 139.817413]},
{name: "Mount Fuji, Japan" ,coordinate:[35.363602, 138.726379]},
{name: "Yokohama, Japan" ,coordinate:[35.443707, 139.638031]},
{name: "Osaka, Japan" ,coordinate:[34.672314, 135.484802]},
{name: "Imperial Palace, Tokyo, Japan" ,coordinate:[35.685360, 139.753372]},
{name: "Naha, Okinawa, Japan" ,coordinate:[26.212313, 127.679153]},
{name: "Ueno Park, Tokyo, Japan" ,coordinate:[35.712223, 139.771118]},
{name: "Sapporo, Japan" ,coordinate:[43.066666, 141.350006]},
{name: "Sensō-ji, Tokyo, Japan" ,coordinate:[35.714661, 139.796783]},
{name: "Kyoto, Kyoto Prefecture, Japan" ,coordinate:[35.011665, 135.768326]},
{name: "Shinjuku Gyoen National Garden, Tokyo, Japan" ,coordinate:[35.685272, 139.709442]},
{name: "Setagaya, Tokyo, Japan" ,coordinate:[35.646572, 139.653244]},
{name: "Fukuoka, Fukuoka, Japan" ,coordinate:[33.583332, 130.399994]},
{name: "Sendai, Miyagi Prefecture, Japan" ,coordinate:[38.268223, 140.869415]},
{name: "Obihiro, Hokkaido, Japan" ,coordinate:[42.923901, 143.196106]},
{name: "Kadena, Japan" ,coordinate:[26.354109, 127.759079]},
{name: "Hiroshima, Hirosima Prefecture, Japan" ,coordinate:[34.383331, 132.449997]},
{name: "Tsūtenkaku, Japan" ,coordinate:[34.652500, 135.506302]},
{name: "Kamigyō-ku, Kyoto, Japan" ,coordinate:[35.028309, 135.753082]},
{name: "Iwaki, Fukushima, Japan" ,coordinate:[37.050419, 140.887680]},
{name: "Nagasaki, Nagasaki Prefecture, Japan" ,coordinate:[32.764233, 129.872696]},
{name: "Nagoya, Chubu, Japan" ,coordinate:[35.183334, 136.899994]},
{name: "Universal Studios Japan, Osaka, Japan" ,coordinate:[34.665394, 135.432526]},
{name: "Tokyo Skytree, Sumida, Tokyo, Japan" ,coordinate:[35.710064, 139.810699]},
{name: "Arashiyama, Kyoto, Japan" ,coordinate:[35.009392, 135.667007]},
{name: "Kobe, Hyogo, Japan" ,coordinate:[34.689999, 135.195557]},
{name: "Sumida, Tokyo, Japan" ,coordinate:[35.710724, 139.801498]},
{name: "Tokyo Haneda Airport, Tokyo, Japan" ,coordinate:[35.553333, 139.781113]},
{name: "Funabashi, Chiba Prefecture, Japan" ,coordinate:[35.694706, 139.982620]},
{name: "Meguro City, Tokyo, Japan" ,coordinate:[35.640278, 139.694763]},
{name: "Hachiko Memorial Statue, Tokyo, Japan" ,coordinate:[35.659088, 139.700470]},
{name: "Akita, Akita Prefecture, Japan" ,coordinate:[39.720009, 140.102570]},
{name: "Tokyo Dome Hotel, Tokyo, Japan" ,coordinate:[35.703468, 139.753220]},
{name: "Ise, Mie Prefecture, Japan" ,coordinate:[34.495380, 136.706146]},
{name: "Toda, Saitama Prefecture, Japan" ,coordinate:[35.817616, 139.677887]},
{name: "Tagajo, Miyagi Prefecture, Japan" ,coordinate:[38.293839, 141.004227]},
{name: "Nagawa, Nagano Prefecture, Japan" ,coordinate:[36.255486, 138.266418]},
{name: "Kawasaki, Kanagawa Prefecture, Japan" ,coordinate:[35.516666, 139.699997]},
{name: "Ginowan, Okinawa Prefecture, Japan" ,coordinate:[26.281574, 127.778633]},
{name: "Nagoya TV Tower, Nagoya, Japan" ,coordinate:[35.172340, 136.908325]},
{name: "Ama, Aichi Prefecture, Japan" ,coordinate:[35.200184, 136.802444]},
{name: "Kyoto Tower, Kyoto, Shimogyo Districts, Japan" ,coordinate:[34.987476, 135.759491]},
{name: "Kobe Port Tower, Kobe, Hyogo Prefecture, Japan" ,coordinate:[34.682629, 135.186707]},
{name: "Meiji Shrine, Tokyo, Japan" ,coordinate:[35.675526, 139.698578]},
{name: "Hakata Port Tower, Fukuoka, Fukuoka Province, Japan" ,coordinate:[33.604282, 130.397751]},
{name: "Kitakyushu, Fukuoka Prefecture, Japan" ,coordinate:[33.883331, 130.883331]},
{name: "Higashiyama Sky Tower, Nagoya, Aichi Prefecture, Japan" ,coordinate:[35.156769, 136.978867]},
{name: "Japan National Stadium, Tokyo, Japan" ,coordinate:[35.677784, 139.713608]},
]
// prettier-ignore
const KoreaFamousPlace = [
{name: "Seoul, South Korea", coordinate: [37.532600, 127.024612]},
{name: "Gangnam-gu, Seoul, South Korea", coordinate: [37.517235, 127.047325]},
{name: "Busan, South Korea", coordinate: [35.166668, 129.066666]},
{name: "Bundang-gu, Seongnam-si, South Korea", coordinate: [37.382698, 127.118904]},
{name: "Squid Game Island Seongapdo", coordinate: [37.255802, 126.306816]},
{name: "Pyeongtaek-si, Gyeonggi, South Korea", coordinate: [36.992107, 127.112946]},
{name: "Namyangju, Gyeonggi, South Korea", coordinate: [37.636002, 127.216530]},
{name: "Pocheon, Gyeonggi, South Korea", coordinate: [37.894917, 127.200356]},
{name: "Incheon, South Korea", coordinate: [37.456257, 126.705208]},
{name: "Lotte World Tower, Seoul, South Korea", coordinate: [37.511234, 127.098030]},
{name: "Paju, Gyeonggi-do, South Korea", coordinate: [37.859234, 126.785042]},
{name: "Guri, Guri-si, Gyeonggi-do, South Korea", coordinate: [37.603405, 127.143738]},
{name: "Daegu, Yeongnam, South Korea", coordinate: [35.866669, 128.600006]},
{name: "Wonju-si, Gangwon-do, South Korea", coordinate: [37.342220, 127.920158]},
{name: "Daegu, North Gyeongsang Province, South Korea", coordinate: [35.866669, 128.600006]},
{name: "Dalseo-gu, Daegu, Republic of Korea", coordinate: [35.834236, 128.534210]},
{name: "Ulsan, Yeongnam, South Korea", coordinate: [35.549999, 129.316666]},
{name: "Lotte World Tower, Jamsil, Seoul, South Korea", coordinate: [37.512779, 127.102570]},
{name: "Daejeon, South Korea", coordinate: [36.351002, 127.385002]},
{name: "Seoul Incheon International Airport, Seoul, South Korea", coordinate: [37.463333, 126.440002]},
{name: "N Seoul Tower, Yongsan, Seoul, South Korea", coordinate: [37.551170, 126.988228]},
{name: "Tongyeong, South Korea", coordinate: [34.855228, 128.429581]},
{name: "Yongsan-gu, Seoul, South Korea", coordinate: [37.533432, 126.979088]},
{name: "Daedeok-gu, Daejeon, South Korea", coordinate: [36.346390, 127.415955]},
{name: "Gwangju, South Jeolla, South Korea", coordinate: [35.166668, 126.916664]},
{name: "Gyo-dong, Daegu, South Korea", coordinate: [35.873367, 128.598831]},
{name: "Gyeongju, Gyeongsangbuk, South Korea", coordinate: [35.835354, 129.263885]},
{name: "Gyeongbokgung Palace, Seoul, South Korea", coordinate: [37.580467, 126.976944]},
{name: "Lotte World Mall, Seoul, South Korea", coordinate: [37.513672, 127.105705]},
{name: "Asan, Chungcheongnam, South Korea", coordinate: [36.806702, 126.979874]},
{name: "Chungju, Chungcheongbuk, South Korea", coordinate: [36.981304, 127.935905]},
{name: "UN Memorial Cemetery in Korea, Busan, South Korea", coordinate: [35.127281, 129.098297]},
{name: "Lotte Hotel Busan, Busan, Busanjin, South Korea", coordinate: [35.156765, 129.055862]},
{name: "North Jeolla Province, Jeollabuk-do, South Korea", coordinate: [35.721180, 127.141327]},
{name: "YeungNam University Library, Gyeongsan, South Korea", coordinate: [35.832870, 128.757416]},
{name: "Everland, Gyeonggi-Do, South Korea", coordinate: [37.293831, 127.202560]},
{name: "Hongcheon-gun, Gangwon, South Korea", coordinate: [37.751591, 128.072021]},
{name: "Incheon Bridge, South Korea", coordinate: [37.413891, 126.566666]},
{name: "Conrad Seoul Hotel, Seoul, South Korea", coordinate: [37.525425, 126.926620]},
{name: "Daehan Dawon Tea Plantation, Boseong, Jeollanam, South Korea", coordinate: [34.715351, 127.080894]},
{name: "Ulleungdo, Buk-myeon, North Gyeongsang, South Korea", coordinate: [37.506367, 130.857147]},
{name: "Guinsa, Yeongchun, Danyang, Chungcheongbuk, South Korea", coordinate: [37.031879, 128.480072]},
{name: "The War Memorial of Korea, Younsan, Seoul, South Korea", coordinate: [37.535278, 126.978897]},
{name: "Gaijisan National Park, Gyeongsangbuk, South Korea", coordinate: [35.789307, 128.104019]},
{name: "Deogsoyeog, Wabu, Namyangju province, South Korea", coordinate: [37.587200, 127.208549]},
]

// prettier-ignore
const Task = [
'서울드와이트 외국인학교 공작교실 Assistant 채용 (Makerspace Technician)',
'네트워크 엔지니어, 통신 공사 엔지니어 채용',
'해운대 브런치카페 프라한(Prahran) 키친 직원 채용',
'의료관광회사 영업부 고객응대 아르바이트 및 경력직 모집',
'유치원.어린이집영어선생님',
'[신규/경력 모집] 건설기계 정비 및 매매',
'제주오리엔탈호텔 조리팀 채용',
'자동차부품 와이어하네스 자동압착 및 단순 조립.검사 생산직 모집',
'학원데스크 리셉션',
'영어권 해외환자 고객관리 매니저를 채용합니다',
'유아영어센터 교사모집-한국인/외국인',
'낙주회관에서 같이 일하실 인재를 모집합니다',
'중국어 가능한 여행사 OP 채용합니다',
'[동래구] 한식형 횟집 홀서빙 구인합니다.',
'해운대 프라한 워크룸(Prahran WORKROOM) 베이커 신입 직원 채용(신규오픈예정)',
'PLC/DDC자동제어설계,공사 및 프로그래머',
'[춘천] 레고랜드 국내 및 외국인 연기자 관리자 모집(파크 유경험자)',
'중국 상품소싱 및 공장통역 중국출장 조선족,한족 우대',
'아파트 빌라 현장 난간설치할 인원 모집합니다.',
'인천공항 면세점 SI 화장품 브랜드 판매사원 채용',
'중국어 가능한 외국인 유학생 모집합니다. (아르바이트)',
'미슐랭스타 파인다이닝 홀사원/캡틴(아르바이트 모집)청담동/외국인가능',
'서울경금속 화성공장 간판제작 사원 모집',
'인천공항 면세점 DJI 드론 스토어 매장 운영 정직원 채용(신입/경력)',
'[펄어비스] 게임번역가 3개월 아르바이트 모집',
'인바운드 여행사 경리 사무보조 단기 아르바이트',
'국제의료관광코디네이터 모집',
'미얀마,인도네시아,네팔,필리핀,스리랑카,캄보디아 외국인 직원,프리랜서 채용',
'[급여협의/면세점] 아이소이 롯데백화점 본점 면세점 판매 사원 모집',
'인바운드 영어 op (신입/경력) 급여및수당',
'GSIS 경기수원외국인학교 조리실장',
'[수원] GSIS경기수원외국인학교 조리실장 채용',
'CNC 공작기계 신입 및 경력 모집',
'[영어가능자] 쿠킹클래스 진행 선생님 구합니다',
'[마케이션] 일본 업무 담당자 채용 (일본인 비자 지원 가능)',
'신재생에너지 사업 개발부문, 관리부문 직원 채용',
'생산 및 사무직 직원을 모집합니다 해남 거주자면 좋습니다.',
'주)골든크라운 대구카지노 환전 및 캐셔 업무 담당자 채용',
'[달천동] 자동차 부품 단순 조립 계약직 사원 모집(외국인 지원 가능)',
'인천 오라클피부과(구월점) 국제협력팀 러시아어 코디네이터 구인',
]

const TaskStatus = new Map([
    ["Posted", 0], //consumer wrote a request but not paid
    ["Paid", 1], //consumer paid for a request
    ["Outdated", 2], // No provider(s) contracted with a consumer
    ["Contracted", 3], // provider(s) contracted with a consumer
    ["Finished", 4], // work has been done!
    ["Failed", 5], // Contraction didn’t work properly
]);

function randPickOne(ids) {
    return ids[Math.floor(Math.random() * ids.length)];
}

function randPick(ids, number) {
    const ret = [];
    for (let i = 0; i < number; i++) {
        ret.push(randPickOne(ids));
    }
    return ret;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const db = require("../models");
        const Request = db.sequelize.models.Request;
        const Consumer = db.sequelize.models.Consumer;
        const Student = db.sequelize.models.Student;
        const Provider = db.sequelize.models.Provider;

        const allStudentData = await Student.findAll({ raw: true });

        const corpConsumer = (await Consumer.findOne({ where: { consumer_type: "corp" } })).get({ plain: true });
        const orgnConsumer = (await Consumer.findOne({ where: { consumer_type: "orgn" } })).get({ plain: true });
        const testConsumer = (await Consumer.findAll({ raw: true })).filter(
            (con) => !con.consumer_email.startsWith("student"),
        );
        const allConsumer = [corpConsumer, orgnConsumer, ...testConsumer];
        const dummyRequests = [];

        for (let i = 1; i <= 30; i++) {
            const taskIdx = Math.floor(Math.random() * Task.length);
            const krAddressIdx = Math.floor(Math.random() * KoreaFamousPlace.length);
            const jpAddressIdx = Math.floor(Math.random() * JapanFamousPlacd.length);

            const ONE_HOUR = 3600 * 1000;
            const ONE_DAY = ONE_HOUR * 24;

            let requestStatus = {};
            let head_count = Math.floor(Math.random() * 4 + 1);
            let providerDataList = [];
            switch (i % 5) {
                // On preceeding requests
                case 0: // posted
                case 1: // paid
                case 3: // contracted
                    // create provider
                    randPick(allStudentData, head_count).forEach((val) => {
                        providerDataList.push({
                            student_id: val.student_id,
                            user_id: val.user_id,
                            request_id: i,
                        });
                    });
                    requestStatus.request_status = i % 5;
                    requestStatus.start_date = new Date(Date.now() + ONE_DAY * 30).toISOString(); // format: "2011-10-05T14:48:00.000Z"
                    requestStatus.end_date = new Date(Date.now() + ONE_DAY * 30).toISOString(); // format: "2011-10-05T14:48:00.000Z"
                    requestStatus.start_time = new Date(Date.now()).toLocaleTimeString("it-IT"); // format: 01:15:30
                    requestStatus.end_time = new Date(Date.now() + ONE_HOUR * 5).toLocaleTimeString("it-IT"); // format: 01:15:30
                    break;
                // Done requests -> provider_ids of done request will be filled at dummy-review.js
                case 2: // outdated
                case 4: // finish
                case 5: // failed
                    requestStatus.request_status = i % 5;
                    requestStatus.start_date = new Date(Date.now() - ONE_DAY * 30).toISOString(); // format: 12/12/2024
                    requestStatus.end_date = new Date(Date.now() - ONE_DAY * 30).toISOString(); // format: 12/12/2024
                    requestStatus.start_time = new Date(Date.now()).toLocaleTimeString("it-IT"); // format: 01:15:30
                    requestStatus.end_time = new Date(Date.now() + ONE_HOUR * 5).toLocaleTimeString("it-IT"); // format: 01:15:30
                    break;
                default:
                    break;
            }

            const randConsumer = randPickOne(allConsumer);

            await Request.create({
                request_id: i,
                consumer_id: randConsumer.consumer_id,
                corp_id: randConsumer.corp_id ?? null,
                orgn_id: randConsumer.orgn_id ?? null,
                title: Task[taskIdx],
                reward_price: Math.floor(Math.random() * 2000 + 20000),
                currency: i % 2 === 0 ? "jp" : "kr",
                content: Task[taskIdx],
                address: i % 2 === 0 ? JapanFamousPlacd[jpAddressIdx].name : KoreaFamousPlace[krAddressIdx].name,
                address_coordinate: {
                    type: "Point",
                    coordinates:
                        i % 2 === 0
                            ? JapanFamousPlacd[jpAddressIdx].coordinate
                            : KoreaFamousPlace[krAddressIdx].coordinate,
                },
                head_count: head_count,
                are_needed: ["you", "body", "head"],
                are_required: ["inner", "peace"],
                provide_food: 0,
                provide_trans_exp: 0,
                prep_material: ["shose", "bike", "car"],
                ...requestStatus,
            });
            await Provider.bulkCreate(providerDataList);
        }
        // await Request.bulkCreate(dummyRequests);

        return;
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Provider", null, {});
        await queryInterface.bulkDelete("Request", null, {});

        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
