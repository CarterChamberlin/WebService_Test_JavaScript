-- Up
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  author INTEGER,
  message STRING,
  FOREIGN KEY(author) REFERENCES users(id)
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email STRING,
  name STRING,
  password STRING
);

CREATE TABLE tokens (
  token STRING PRIMARY KEY,
  user INTEGER,
  FOREIGN KEY(user) REFERENCES users(id)
);

-- Down
DROP TABLE messages;
DROP TABLE users;
DROP TABLE tokens;