import express from "express";
import userController from "../../controllers/user.controller";

class V1 {
    public router = express.Router();

    constructor() {
        this.router.use("/users", userController);
    }
}

export default new V1().router;
