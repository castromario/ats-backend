import colors from "colors";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import "express-async-errors";
import morgan from "morgan";
const app = express();
dotenv.config();

import path, { dirname } from "path";
import { fileURLToPath } from "url";

import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import xss from "xss-clean";

// db and authenticateUser
import connectDB from "./db/connect.js";

// routers
import authRouter from "./routes/authRoutes.js";
import jobsRouter from "./routes/jobsRoutes.js";
import fileRouter from "./routes/fileRoutes.js";
import tranRouter from "./routes/tranRoutes.js";

// middleware
import authenticateUser from "./middleware/auth.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// only when ready to deploy
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",

  credentials: true, // If you're using cookies or authentication
  optionsSuccessStatus: 204, // Some legacy browsers choke on 200
};

app.use(cors(corsOptions));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);
app.use("/api/v1/file", fileRouter);
app.use("/api/v1/tran", tranRouter);

// only when ready to deploy
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
app.use((req, res, next) => {
  console.log("Request received:", req.headers.origin); // Log the origin header
  next();
});

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(
        colors.rainbow(
          `Server is running on port http://localhost:${process.env.PORT}`
        )
      );
    });
  } catch (error) {
    console.log(error);
  }
};

start();
