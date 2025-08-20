import express from "express";
import cors from "cors";
import posts from "./routes/posts";
import search from "./routes/search";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
app.use(cors({
  origin: [FRONTEND_URL],
  credentials: true,
  methods: ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.options("*", cors());

app.use(express.json());

app.use("/posts", posts);
app.use("/search", search); // ← 追加

export default app;
