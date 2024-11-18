import express from "express";
import cors from "cors";
import movies from "./api/movies.route.js";

//initialize express
const app = express();

//enable cors
app.use(cors());
app.use(express.json());

//define the route for the movies
app.use("/api/v1/movies", movies);

//define the route for the root
app.use("*", (req, res) => {
  res.status(404).json({ error: "not found" });
});

export default app;
