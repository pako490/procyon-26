
import express from "express";
import cors from "cors";
import "dotenv/config";
import rubricsRoutes from "./routes/rubrics.js";
import questionRoutes from "./routes/question.js";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
// TODO: implement users?
app.use(userRoutes);
app.use("/api/rubrics", rubricsRoutes);
app.use("/api/question", questionRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
