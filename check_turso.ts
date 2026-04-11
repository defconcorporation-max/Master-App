import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const tursoUrl = process.env.DEFCON_TURSO_URL;
const tursoToken = process.env.DEFCON_TURSO_TOKEN;

async function run() {
    if (!tursoUrl) return console.log("NO URL in .env");
    const turso = createClient({ url: tursoUrl, authToken: tursoToken });
    try {
        const res = await turso.execute("SELECT * FROM shoots LIMIT 1");
        console.log(res.rows[0]);
    } catch (e) {
        console.error("error:", e);
    }
}
run();
