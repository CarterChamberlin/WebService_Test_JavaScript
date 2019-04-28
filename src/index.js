import express from "express";
import bodyParser from "body-parser";
import expHandle from "express-handlebars";
import sqlite from "sqlite";
import authRouter, { authorize } from "./auth";
import cookieParser from "cookie-parser";

const app = express();

export const dbPromise = sqlite.open("./database.sqlite");

dbPromise.then(async db => {
  db.migrate();
});

app.engine("handlebars", expHandle({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authorize);

app.get("/", async (req, res) => {
  const db = await dbPromise;
  const messages = await db.all("SELECT messages.message, users.name as author FROM messages LEFT JOIN users WHERE messages.author=users.id;"); //(author, message)
  console.log(messages);
  res.render("home", { messages: messages, user: req.user });
});

app.post("/message", async (req, res) => {
  const db = await dbPromise;
  await db.run(
    "INSERT INTO messages (author, message) VALUES (?, ?)",
    req.user.id,
    req.body.message
  );
  res.redirect("/");
});

app.use(authRouter);

app.listen(8080, () => console.log("Listening on http://localhost:8080"));
