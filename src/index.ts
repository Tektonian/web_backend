import { Request, Response, NextFunction } from "express";

interface netProps {
    req: Request;
    res: Response;
    next: NextFunction;
}

const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan"); // 로깅 라이브러리
const cors = require("cors"); // cors 보안
const app = express();

app.set("port", process.env.PORT || 3000);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(({ req, res, next }: netProps) => {
    res.setHeader(
        // Do not Touch!
        "Content-Security-Policy-Report-Only",
        "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'",
    );

    next();
});

app.use(logger("combined"));
