import express from "express";
import bcrypt from "bcrypt";
import { dbPromise } from "./index";
import * as yup from "yup";
import uuid from "uuid/v4";

const router = express.Router();
const saltRounds = 10;
const registerSchema = yup
  .object()
  .shape({
    password: yup.string().required(),
    name: yup.string().required(),
    email: yup
      .string()
      .email()
      .required()
  })
  .noUnknown();

// authorize -- looks up user

export const authorize = async (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    next();
    return;
  }

  const db = await dbPromise;
  const user = await db.get(
    "SELECT users.email, users.name, users.id as id FROM tokens LEFT JOIN users ON tokens.user = users.id WHERE token=?",
    accessToken
  );

  if (!user) {
    next();
    return;
  }

  req.user = user;
  next();
};

// require auth -- ensure user is logged in
// register
router.get("/register", async (req, res) => {
  if (req.user) {
    res.redirect("/");
    return;
  }

  res.render("register");
});

router.post("/register", async (req, res) => {
  const { password, name, email } = req.body;

  try {
    registerSchema.validateSync(req.body, { abortEarly: false });
  } catch (e) {
    res.render("register", { errors: e.errors });
    return;
  }

  const hash = await bcrypt.hash(password, saltRounds);
  const db = await dbPromise;
  const existUser = await db.get("SELECT * FROM users WHERE email=?;", email);

  if (existUser) {
    res.render("register", { errors: ["user already exists"] });
    return;
  }

  await db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?);",
    name,
    email,
    hash
  );

  const newUser = await db.get("SELECT id FROM users WHERE email=?;", email);

  const token = uuid();
  await db.run(
    "INSERT INTO tokens (token, user) values (?, ?);",
    token,
    newUser.id
  );

  res.cookie("accessToken", token);
  res.redirect("/");
});

// login
router.get("/login", async (req, res) => {
  if (req.user) {
    res.redirect("/");
    return;
  }

  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.render("login", { errors: ["missing required parameter"] });
    return;
  }

  const db = await dbPromise;
  const user = await db.get("SELECT * FROM users WHERE email=?;", email);
  if (!user) {
    res.render("login", { errors: ["user not found"] });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.render("login", { errors: ["user not found"] });
    return;
  }

  const token = uuid();
  await db.run(
    "INSERT INTO tokens (token, user) values (?, ?);",
    token,
    user.id
  );

  res.cookie("accessToken", token);
  res.redirect("/");
});

export default router;
