import schedule from "node-schedule";
import fs from "fs";
import { sendMessage } from "../controllers/chat/chatContentController";

export const __initSchedule = () => {
    if (process.env.NODE_ENV === "development") {
        initDevelopment();
    } else if (process.env.NODE_ENV === "production") {
        initProduction();
    }
    initCommon();
};

const getEventHandler = (name: string, target: string, action: string) => {
    return () => {
        console.log("Event Handler");
        process.exit();
    };
};

export const addEventSchedule = (
    name: string,
    target: string,
    action: string,
    date: Date,
) => {
    schedule.scheduleJob(
        JOB_NAME_CONSTRUCTOR(name, target, action),
        date,
        getEventHandler(name, target, action),
    );
};

const initDevelopment = () => {};

const initProduction = () => {
    if (fs.existsSync("events.json")) {
        const events = JSON.parse(fs.readFileSync("events.json", "utf-8"));

        for (let event of events) {
            const { name, target, action, date } = event;
            schedule.scheduleJob(
                JOB_NAME_CONSTRUCTOR(name, target, action),
                new Date(date),
                getEventHandler(name, target, action),
            );
        }
    }
};

const initCommon = () => {
    // do something when app is closing
    process.on("exit", __exitHandler);

    // catches ctrl+c event
    process.on("SIGINT", __exitHandler);

    // catches "kill pid" (for example: nodemon restart)
    process.on("SIGUSR1", __exitHandler);
    process.on("SIGUSR2", __exitHandler);

    // catches uncaught exceptions
    process.on("uncaughtException", __exitHandler);
};

const JOB_NAME_CONSTRUCTOR = (name: string, target: string, action: string) => {
    return `${name}:${target}:${action}`;
};

const JOB_NAME_PARSER = (
    jobName: string,
): { name: string; target: string; action: string } => {
    const sliced = jobName.split(":");
    return {
        name: sliced[0],
        target: sliced[1],
        action: sliced[2],
    };
};

const __exitHandler = () => {
    const ret = [];

    const jobs = schedule.scheduledJobs;
    console.log("__exitHandler", jobs);
    for (let job of Object.entries(jobs)) {
        const jobName = job[0];
        const date = job[1].nextInvocation();
        if (date !== null) {
            const { name, target, action } = JOB_NAME_PARSER(jobName);
            ret.push({
                name,
                target,
                action,
                date: new Date(date).toUTCString(),
            });
        }
    }
    const events = fs.writeFileSync(
        "events.json",
        JSON.stringify(ret),
        "utf-8",
    );
};
