import { omit, pick } from "es-toolkit";
import { describe, test, expect, beforeAll } from "vitest";
import { models } from "../../models/rdbms/index";
const User = models.User;
const Consumer = models.Consumer;

const randomPick = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

describe("Consumer 모델 Validation 테스트", () => {
    test("중복 Consumer Profile 생성 - 중복된 데이터 생성 시도 시 에러 발생 필요", async () => {
        const user = randomPick(await User.findAll({ raw: true }));

        const consumer = randomPick(await Consumer.findAll({ where: { user_id: user.user_id }, raw: true }));
        await expect(async () => await Consumer.create(omit(consumer, ["consumer_id"]))).rejects.toThrow(
            "Duplicated consumer type",
        );
    });

    test("비중복 Consumer Profile 생성 - 데이서 정상 생성", async () => {
        const user = await User.findOne({ where: { email: "kang@test.com" }, raw: true });

        const consumer = randomPick(await Consumer.findAll({ where: { user_id: user.user_id }, raw: true }));

        await Consumer.destroy({ where: { consumer_id: consumer.consumer_id }, force: true });

        const created = await Consumer.create(omit(consumer, ["consumer_id"]));

        expect(pick(created.get({ plain: true }), ["consumer_email", "consumer_type"])).toEqual(
            pick(consumer, ["consumer_email", "consumer_type"]),
        );
    });
});
