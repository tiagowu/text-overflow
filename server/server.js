// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Please provide a session secret.");
  process.exit(1);
}

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const secret = process.argv[2];
app.use(
  session({
    secret: `${secret}`,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 },
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", require("./routes/users.js"));
app.use("/answers", require("./routes/answers.js"));
app.use("/comments", require("./routes/comments.js"));
app.use("/questions", require("./routes/questions.js"));
app.use("/tags", require("./routes/tags.js"));

const port = 8000;
const mongoDB = "mongodb://127.0.0.1:27017/fake_so";

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
