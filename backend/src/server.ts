import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.info(`MONETA api running on port ${env.PORT}`);
});

process.on("SIGTERM", () => {
  server.close();
});
