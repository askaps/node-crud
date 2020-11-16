import bunyan from "bunyan";
import path from "path";
import * as rfs from "rotating-file-stream";

const loggerInstance = bunyan.createLogger({
    name: "heeko-backend-logger",
    serializers: {
        req: require("bunyan-express-serializer"),
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err
    },
    stream: rfs.createStream("access.log", {
        interval: "1d",
        path: path.join(__dirname, "log")
    }),
    level: "info"
});

const logResponse = (id: string, body: any, statusCode: number) => {
    const log = loggerInstance.child({
        id,
        body,
        statusCode
    }, true);
    log.info("response");
};

export {loggerInstance, logResponse};
