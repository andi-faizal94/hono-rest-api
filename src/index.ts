import { Hono } from "hono";
import { logger } from "hono/logger";
import { Routes } from "./routes";
import { FileRoutes } from "./routes/file";

const app = new Hono().basePath("/api");

app.use(logger());
app.route("/", FileRoutes);
app.route("/posts", Routes);

export default app;
