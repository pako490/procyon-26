import express from "express";
import cors from "cors";
import rubricsRoutes from "./routes/rubrics.js";
import questionRoutes from "./routes/question.js";
import userRoutes from "./routes/users.js";
import journalRoutes from "./routes/journals.js"
import issueRoutes from "./routes/issues.js";
import paperRoutes from "./routes/papers.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());


app.use("/api/rubrics", rubricsRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/journals", journalRoutes)
app.use("/api/issues", issueRoutes);
app.use("/api/papers", paperRoutes);

export default app;
