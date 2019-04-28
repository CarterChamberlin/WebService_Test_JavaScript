import express from "express";
import bodyParser from "body-parser";
import expHandle from "express-handlebars";
import sqlite from "sqlite";
import authRouter from "./auth";

const app = express();

export const dbPromise = sqlite.open("./database.sqlite");

dbPromise.then(async db => {
  db.migrate({ force: "last" });
});

app.engine("handlebars", expHandle({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const db = await dbPromise;
  const messages = await db.all("SELECT * FROM messages"); //(author, message)
  console.log(messages);
  res.render("home", { messages: messages });
});

app.post("/message", async (req, res) => {
  const db = await dbPromise;
  await db.run(
    "INSERT INTO messages (author, message) VALUES (?, ?)",
    req.body.author,
    req.body.message
  );
  res.redirect("/");
});

app.use(authRouter);

app.listen(8080, () => console.log("Listening on http://localhost:8080"));
