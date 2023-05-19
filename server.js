import { MongoClient, ObjectId } from "mongodb";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from "bcrypt";

const saltRounds = 10;

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
    next();
  } else {
    res.status(401).send("Unautorized, Not logged in");
  }
};

app.get("/api", async (req, res) => {
  res.send(req.session);
});

// LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ loggedIn: false });
  });
});

// CREATES UNIQUE USER, HASHES PASS
app.post("/api/user", async (req, res) => {
  const existingUser = await users.findOne({ user_name: req.body.user_name });
  if (existingUser) {
    res.status(409).send("Conflict, Username taken.");
  } else {
    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
      if (err) {
        console.log(err);
        return;
      }
      const cryptInfo = { ...req.body, password: hash };
      const result = await users.insertOne(cryptInfo);
      res.json({ answer: "ok", result });
    });
  }
});
// LOGIN
app.post("/api/login", async (req, res) => {
  const user = await users.findOne({ user_name: req.body.user_name });
  if (user) {
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err) {
        console.log(err);
        return;
      } else if (result) {
        const { password, ...userInfo } = user;
        req.session.user = userInfo;
        res.json({ loggedIn: true });
      }
    });
  } else {
    res.status(401).send("Unauthorized");
  }
});
// CHECKING FOR USER
app.get("/api/loggedin", isAuthorized, async (req, res) => {
  res.json({ loggedIn: true, user: req.session.user });
});

app.get("/api/accounts/:id", isAuthorized, async (req, res) => {
  const userAccounts = await accounts
    .find({
      ownerId: req.params.id,
    })
    .toArray();
  res.json({ success: true, userAccounts });
});

app.post("/api/account/delete/:id", isAuthorized, async (req, res) => {
  await accounts.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.json({ success: true, deleted: true });
});

app.put("/api/account/update/:id", isAuthorized, async (req, res) => {
  const updatedAccount = await accounts.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { amount: req.body.amount } }
  );
  res.json({ success: true, updatedAccount });
});

app.get("/api/account/:id", isAuthorized, async (req, res) => {
  const singleAccount = await accounts.findOne({
    _id: new ObjectId(req.params.id),
  });
  res.json({ success: true, singleAccount });
});

app.post("/api/accounts", isAuthorized, async (req, res) => {
  const newAccount = await accounts.insertOne(req.body);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Express-server running on port:${port}`);
});
