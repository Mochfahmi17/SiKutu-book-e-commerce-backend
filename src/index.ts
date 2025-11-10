import express, { Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import connectDB from "./database/config/connectDB";
import bookRouter from "./routes/book.route";
import errorHandler from "./middleware/errorHandler";
import authorRouter from "./routes/author.route";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());
app.use(cors({ origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "http://localhost:5173", credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));

app.get("/", (req: Request, res: Response) => {
  res.send(`Server is running at http://localhost:${port}`);
});

//* Endpoint API
app.use("/api/books", bookRouter);
app.use("/api/authors", authorRouter);

//* Global error handling
app.use(errorHandler);

connectDB()
  .then(() =>
    app.listen(port, () => {
      console.log(`Server up and running at http://localhost:${port}`);
    })
  )
  .catch((e) => console.log(e));
