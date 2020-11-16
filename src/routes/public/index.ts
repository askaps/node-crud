import express from "express";
import userController from "../../controllers/user.controller";

class Index {
    public router = express.Router();

    constructor() {
        this.router.use("/", userController);
    }
}

export default new Index().router;
