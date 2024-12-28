const express = require('express');
const path = require('path');
const crypto = require("crypto");
const sqlite3 = require("sqlite3");
const discordauth = require("./discordauth");
const pteroauth = require("./pteroauth");
const cookieParser = require("cookie-parser")
const app = express();
app.use(cookieParser())
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

const getUserBySession = (session) => {
  return new Promise((resolve, reject) => {
    database.all("SELECT * FROM users WHERE session_id = ?",[session], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};
const checkSession = async (session) =>{
  const user = await getUserBySession(session);
  if(user.length == 0){
    return false;
  }else{
    return true;
  }
}

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
  return user[0].session_id;
}
  
}catch{
  console.error("Invalid code");
}

  
};
app.get('/',async (req,res)=>{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.redirect('/dash')
  }else{
    res.redirect("/login");
  }
})
app.get('/dash',async (req,res)=>{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.sendFile(path.join(__dirname, 'routes', 'dashboard.html'));
  }else{
    res.redirect("/login");
  }
})
app.get('/login', async (req, res) => {
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.redirect("/dashboard");

  }else{
    res.sendFile(path.join(__dirname, 'routes', 'login.html'));
  }
});

app.get('/callback', async (req, res) => {

try{
const session = await AddOrGetUser(req.query.code);
res.cookie("session_id",session);
res.redirect("/");
}catch{
console.error("Cant get session id");
}
});
app.get('/create',async (req,res)=>{
  try{
  const memory = req.query.memory;
  const cpu = req.query.cpu;
  const storage = req.query.storage
  const name = req.query.name;
  const user = await getUserBySession(req.cookies.session_id);
  const userid = user[0].pteroid
  const servers = await pteroauth.getServers({id:userid})
  const servercount = servers.length
  if(servercount == 0){
  pteroauth.createServer({memory:memory,cpu:cpu,storage:storage,user: userid,name:name}).then(response=>res.send(response));
  }else{res.send("You already own 1 server")}
  }catch(err){
    console.error(err)
  }
})
app.get('/getservers',async (req,res) =>{
try{
  const user = await getUserBySession(req.cookies.session_id);
  const servers = await pteroauth.getServers({id:user[0].pteroid})
  res.json(servers)
}catch(err){
  console.error(err)
}
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
