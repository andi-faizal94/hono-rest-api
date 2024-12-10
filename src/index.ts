//import hono
import { Hono } from "hono";

//import routes
import { Routes } from "./routes";

// Initialize the Hono app
const app = new Hono().basePath("/api");

// Posts Routes
app.route("/posts", Routes);

export default app;
