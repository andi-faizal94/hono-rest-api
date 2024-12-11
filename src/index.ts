//import hono
import { Hono } from "hono";
import { logger } from "hono/logger";
//import routes
import { Routes } from "./routes";

// Initialize the Hono app
const app = new Hono().basePath("/api");

// Posts Routes
app.use(logger());
app.route("/posts", Routes);

export default app;
