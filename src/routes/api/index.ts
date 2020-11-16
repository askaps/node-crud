import express from "express";
import v1ApiController from "./v1";

class Index {
    public router = express.Router();

    constructor() {
        this.router.use("/v1", v1ApiController);
    }
}

export default new Index().router;
