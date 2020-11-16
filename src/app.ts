import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import mongoose = require("mongoose");
import morgan from "morgan";
import path from "path";
import * as rfs from "rotating-file-stream";
import * as logger from "./logger";
import routes from "./routes";

class App {

    public app: express.Application;
    public dotenv: dotenv.DotenvConfigOptions;
    private corsOption = {
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
        exposedHeaders: ["x-auth-token"]
    };
    private logDirectory = path.join(__dirname, "log");

    constructor() {
        dotenv.config();

        this.mongoSetup();
        this.app = express();
        this.initMiddlewares();
        this.initRoutes();

        routes.init(this.app);
    }

    private mongoSetup(): void {
        global.Promise = require("q").Promise;
        mongoose.Promise = global.Promise;
        mongoose.connect(process.env.MONGODB_CONNECTION, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        }).then(
            // tslint:disable-next-line: no-console
            () => { console.log("MongoDB connected"); },
            (err) => { throw err; }
        );
    }

    private initMiddlewares(): void {
        this.app.use(cors(this.corsOption));

        morgan.token("id", (req: any) => {
            return req.id;
        });

        // ensure log directory exists
        fs.existsSync(this.logDirectory) || fs.mkdirSync(this.logDirectory);

        this.app.use(
            morgan(
                "combined",
                {
                    stream: rfs.createStream("access.log", {
                        interval: "1d",
                        path: this.logDirectory
                    })
                }
            )
        );

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));

        this.app.use(express.static("public"));
        this.app.set("view engine", "pug");
        this.app.set("views", path.join(__dirname, "../public"));

        this.app.use((req: any, res, next) => {
            const log = logger.loggerInstance.child({
                id: req.id,
                body: req.body
            }, true);
            log.info({
                req: req
            });
            next();
        });

        this.app.use((req: any, res, next) => {
            const afterResponse = () => {
                res.removeListener("finish", afterResponse);
                res.removeListener("close", afterResponse);
                const log = logger.loggerInstance.child({
                    id: req.id
                }, true);
                log.info({res}, "response");
            };

            res.on("finish", afterResponse);
            res.on("close", afterResponse);
            next();
        });

    }

    private initRoutes(): void {
        const router = express.Router();
        router.get("/", (req, res, next) => {
            res.json({status: true});
        });

        this.app.use("/", router);
    }
}

export default new App().app;
