import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    // tslint:disable-next-line: no-console
    console.log("Express server listening on port " + PORT);
});
