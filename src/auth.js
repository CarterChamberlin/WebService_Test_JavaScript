import express from "express";
import bcrypt from "bcrypt";
import { dbPromise } from "./index";
import * as yup from "yup";

const router = express.Router();
const saltRounds = 10;
const registerSchema = yup
  .object()
  .shape({
    password: yup
      .string()
      .min(10)
      .required(),
    name: yup.string().required(),
    email: yup
      .string()
      .email()
      .required()
  })
  .noUnknown();

// authorize -- looks up user

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
    res.render("register", { error: "user already exists" });
    return;
  }

  await db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?);",
    name,
    email,
    hash
  );
  res.redirect("/");
  // issue an access token
});

// login
router.get("/login", async (req, res) => {
  if (req.user) {
    res.redirect("/");
    return;
  }

  res.render("login");
});

export default router;
