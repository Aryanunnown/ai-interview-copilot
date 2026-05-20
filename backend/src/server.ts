import { createApp } from "./app/app.js";
import { env, validateEnv } from "./config/env.js";
import { prisma } from "./config/prisma.js";

validateEnv();

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`Backend listening on port ${env.port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
