import express from "express";
import cors from "cors";
import rubricsRoutes from "./routes/rubrics.js";
import questionRoutes from "./routes/question.js";
import userRoutes from "./routes/users.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.use(userRoutes);
app.use("/api/rubrics", rubricsRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/users", userRoutes);

export default app;
