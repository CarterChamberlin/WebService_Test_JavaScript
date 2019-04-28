-- Up
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  author INTEGER,
  message STRING,
  FOREIGN KEY(author) REFERENCES users(id)
);
CREATE TABLE users (id INTEGER PRIMARY KEY, email STRING, name STRING, password STRING);


-- Down
DROP TABLE messages;
DROP TABLE users;