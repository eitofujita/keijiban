import express from "express";
import cors from "cors";
import posts from "./routes/posts";
import search from "./routes/search";
import communities from "./routes/communities";

const app = express();

const ALLOWED_ORIGINS = (process.env.FRONTEND_URLS ?? "http://localhost:5173,http://localhost:5174").split(",");
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.options("*", cors());

app.use(express.json());

app.use("/posts", posts);
app.use("/search", search);
app.use("/communities", communities);

export default app;
