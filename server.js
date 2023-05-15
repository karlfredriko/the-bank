import { MongoClient, ObjectId } from "mongodb";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express();
const port = 3000;

const client = new MongoClient("mongodb://127.0.0.1:27017");
await client.connect();

const db = client.db("bank");
const users = db.collection("users");
const accounts = db.collection("accounts");

app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "very secret",
  })
);

const isAuthorized = (req, res, next) => {
  if (req.session.user) {
    console.log("You'r authorized");
    next();
  } else {
    console.log("Not authorized:(");
    next();
  }
};

app.get("/api", async (req, res) => {
  res.json(req.session);
});

app.get("/api/login", async (req, res) => {
  const user = {
    user: "Karl",
    password: "123test",
  };
  const result = await users.findOne(user);
  if (result) {
    console.log("yea bb");
    req.session.user = user.user;
    res.json("user", user, "session", req.session);
  } else {
    res.status(401).send("unautorized");
  }
});

app.use(isAuthorized);

app.get("/api/loggedin", isAuthorized, async (req, res) => {});

app.listen(port, () => {
  console.log(`Express-server running on port:${port}`);
});
