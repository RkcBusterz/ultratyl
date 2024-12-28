const express = require('express');
const path = require('path');
const crypto = require("crypto");
const sqlite3 = require("sqlite3");
const discordauth = require("./discordauth");
const pteroauth = require("./pteroauth");

const app = express();
const port = 3000;
const database = new sqlite3.Database("logins.db");

app.use(express.static('routes'));

database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    pteroid INT UNIQUE,
    email TEXT UNIQUE,
    user TEXT UNIQUE,
    session_id TEXT UNIQUE
  )
`);

const getUser = (email) => {
  return new Promise((resolve, reject) => {
    database.all("SELECT * FROM users WHERE email = ?",[email], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};




const AddOrGetUser = async (code) => {

try{
  const userinfo = await discordauth.fetchUser(code);
  const user = await getUser(userinfo.email)
  if(user.length == 0){

    const insert = database.prepare(
      'INSERT INTO users (pteroid, email, user, session_id) VALUES (?, ?, ?, ?)'
    );
    const session_id = crypto.randomBytes(25).toString('hex');
  
  const pteroinfo = await pteroauth.addUser({
    email: userinfo.email,
    username: userinfo.username,
    global_name: userinfo.global_name,
  });
  insert.run(
    pteroinfo.attributes.id,
    userinfo.email,
    userinfo.username,
    session_id
  );
  return session_id;
}else {
  return user[0].session_id
}
  
}catch{
  console.error("Invalid code")
}

  
};

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'routes', 'login.html'));
});

app.get('/callback', async (req, res) => {

try{
const session = await AddOrGetUser(req.query.code)
res.cookie("session_id",session)
res.send("GOOGLE")
}catch{
console.error("Cant get session id")
}
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
