require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const allowedOrigins = ["https://textoverflow.tiagowu.com", "https://www.textoverflow.tiagowu.com", "http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60, secure: true, sameSite: "none" },
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", express.static(path.join(__dirname, "../client/public")));

app.use("/", require("./routes/users.js"));
app.use("/answers", require("./routes/answers.js"));
app.use("/comments", require("./routes/comments.js"));
app.use("/questions", require("./routes/questions.js"));
app.use("/tags", require("./routes/tags.js"));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_URI;

mongoose.set("strictQuery", true);
(async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
})();
