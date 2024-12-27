const express = require('express');
const path = require('path');
const app = express();
const discordauth = require("./discordauth");
const port = 3000;
const sqlite3 = require("sqlite3");
const database = new sqlite3.Database("logins.db")
app.use(express.static('routes'));
database.exec(`
  CREATE TABLE IF NOT EXISTS users(
  pteroid INT,
  email TEXT,
  user TEXT,
  session_id TEXT
  )
  `)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'routes', 'login.html'));
});
app.get('/callback',async (req,res)=>{
const userinfo = await discordauth.fetchUser(req.query.code)
res.send(userinfo)



})
// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
