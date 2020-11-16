import express from "express";
import apiRoute from "./api";
import publicRoute from "./public";

class Index {

    public init(server: any) {
        server.get("*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
            // tslint:disable-next-line:no-console
            console.log(`Request made to url: ${ req.originalUrl }`);
            return next();
        });

        server.use("/api", apiRoute);

        server.use("/public", publicRoute);
    }
}

export default new Index();
