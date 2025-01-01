
const express = require('express');
const path = require('path');
const crypto = require("crypto");
const sqlite3 = require("sqlite3");
const discordauth = require("./discordauth");
const pteroauth = require("./pteroauth");
const cookieParser = require("cookie-parser");
const config = require("./settings.json")

const app = express();
app.use(cookieParser())
const port = 3000;
const database = new sqlite3.Database("data.db");

app.use(express.static('routes'));
try{
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    pteroid INT UNIQUE,
    email TEXT UNIQUE,
    user TEXT UNIQUE,
    session_id TEXT UNIQUE,
    coins INTEGER DEFAULT 0
  );

  
`);
database.exec(`
CREATE TABLE IF NOT EXISTS servers (
    userid INT,
    serverid INT UNIQUE,
    expiry TEXT
    );
  `)

}catch(err){

}
const getUser = (email) => {
  return new Promise((resolve, reject) => {
    database.all("SELECT * FROM users WHERE email = ?", [email], (err, rows) => {
<<<<<<< HEAD
      resolve(rows)
=======
      if (err) {
        console.error("Error querying user:", err);
        return reject(err);
      }
      if (rows.length === 0) {
        console.warn(`No user found for email: ${email}`);
        return resolve(null);
      }
      resolve(rows[0]);
>>>>>>> 17ad92cf4d8218f415758c4555e85dd1bafcbe79
    });
  });
};

const getUserBySession = (session) => {
  try{
  return new Promise((resolve, reject) => {
    database.all("SELECT * FROM users WHERE session_id = ?",[session], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}catch(err){}
};
const checkSession = async (session) =>{
  try{
  const user = await getUserBySession(session);
  if(user.length == 0){
    return false;
  }else{
    return true;
  }}catch(err){}
}
const addServer = async (id,userid) =>{
  try{
  let currentTime = new Date();
  let expiry = currentTime.setHours(currentTime.getHours() + 24)
  const insert = database.prepare(
    'INSERT INTO servers (userid, serverid, expiry) VALUES (?, ?, ?)');
  insert.run(
    userid,
    id,
    expiry
  );
}
catch(err){
  console.error(err)
}
}

const deleteServer = async (serverId)=>{
  try{
    const remove = database.prepare(
      'DELETE FROM servers WHERE serverid = ?');
      remove.run(serverId)
  }catch(err){}
}

const addOrRemoveCoin = async (userid,coins)=>{
  try{
  const user = await new Promise((resolve, reject) => {
    database.all("SELECT * FROM users WHERE pteroid = ?",[userid], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
var userCoins = user[0].coins
userCoins = userCoins + coins
database.run(`UPDATE users SET coins = ? WHERE pteroid = ?`,[userCoins,userid])
  }catch(err){}
}


const renewServer = async (serverid) =>{
try{
  const server = await new Promise((resolve, reject) => {
    database.all("SELECT * FROM servers WHERE serverid = ?",[serverid], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
  const user = await new Promise((resolve, reject) => {
    database.all("SELECT * FROM users WHERE pteroid = ?",[server[0].userid], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
  if(user[0].coins >= config.coins.renew){
addOrRemoveCoin(server[0].userid,(config.coins.renew)* -1)
pteroauth.unsuspendServer(serverid)
}else{
  pteroauth.suspendServer(serverid)
}
  
}catch(err){}
}

const AddOrGetUser = async (code) => {

try{
  const userinfo = await discordauth.fetchUser(code);
  console.log(`User info is ${JSON.stringify(userinfo)}`);
  const user = await getUser(userinfo.email)
  console.log(`Users in db are ${user.length}`)
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
  console.log(pteroinfo);
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

const renewAll = async () =>{
  database.all('SELECT * FROM servers', [], (err, rows) => {
    if (err) {
      throw err;
    }
  
    // Log each row to the console
    rows.forEach((row) => {
      renewServer(row.serverid)
    });
  });
}




app.get('/',async (req,res)=>{
  try{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.redirect('/dash')
  }else{
    res.redirect("/login");
  }
}catch(err){}
})
app.get('/dash',async (req,res)=>{
  try{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.sendFile(path.join(__dirname, 'routes', 'dashboard.html'));
  }else{
    res.redirect("/login");
  }
}catch(err){}
})
app.get('/earn',async (req,res)=>{
  try{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.sendFile(path.join(__dirname, 'routes', 'earn.html'));
  }else{
    res.redirect("/login");
  }
}catch(err){}
})
app.get('/account', async(req,res)=>{
  try{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.sendFile(path.join(__dirname, 'routes', 'accounts.html'));
  }else{
    res.redirect("/login");
  }}catch(err){}
})


app.get('/login', async (req, res) => {
  try{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.redirect("/dashboard");

  }else{
    res.sendFile(path.join(__dirname, 'routes', 'login.html'));
  }
}catch(err){}
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
  if(memory > 0 && cpu > 0 && storage > 0 && name.length > 0){
  if(servercount == 0){
  pteroauth.createServer({memory:memory,cpu:cpu,storage:storage,user: userid,name:name}).then(response=>{
    res.send(response)
    addServer(response.attributes.id,userid)
  });
  }else{res.send("You already own 1 server")}}
  else {res.send("Invalid values, please check did you forgot name or any other input")}
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
app.get('/limits',async (req,res)=>{
  res.json({cpu: config.Pterodactyl.specifications.cpu,ram: config.Pterodactyl.specifications.memory,storage: config.Pterodactyl.specifications.storage})
})
app.get('/getuser',async (req,res)=>{
  try{
  const user = await getUserBySession(req.cookies.session_id)
  res.send(user)
  }catch(err){}
})


app.get('/changepass',async (req,res)=>{
  try{
  const user = await getUserBySession(req.cookies.session_id)
  const newpass = await pteroauth.changePassword(user[0].email)
  res.send(newpass)
  }catch(err){}
})


app.get('/createserver', async (req,res)=>{
  try{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.sendFile(path.join(__dirname, 'routes', 'create.html'));
  }else{
    res.redirect("/login");
  }
  }catch(err){}
})


app.get('/servers',async(req,res)=>{
  try{
  const session = await checkSession(req.cookies.session_id);
  if(session){
    res.sendFile(path.join(__dirname, 'routes', 'servers.html'));
  }else{
    res.redirect("/login");
  }
}catch(err){}
})

app.get('/delete', async (req, res) => {
  try {
    if (!req.query.num) {
      return res.status(400).send("Missing server index (num).");
    }

    const user = await getUserBySession(req.cookies.session_id);
    const servers = await pteroauth.getServers({ id: user[0].pteroid });

    // Check if the index is valid
    const serverIndex = parseInt(req.query.num, 10);
    if (isNaN(serverIndex) || serverIndex < 0 || serverIndex >= servers.length) {
      return res.status(400).send("Invalid server index.");
    }

    const serverId = servers[serverIndex].attributes.id;
    await pteroauth.deleteServer(serverId);
    deleteServer(serverId)
    res.send("Server deleted successfully.");
  } catch (err) {
    console.error("Error deleting server:", err);
    res.status(500).send("An error occurred while deleting the server.");
  }
});

app.get('/coins', async (req,res)=>{
  try{
  const user = await getUserBySession(req.cookies.session_id)
  const coins = await user[0].coins
    res.send({coins:coins})
}catch(err){}
})

app.get('/logininfo',async(req,res)=>{
  res.send({url: config.dash.url,clientid:config.Discord.CLIENT_ID})
})
app.get('/getcoins',async(req,res)=>{
  try{
    const user = await getUserBySession(req.cookies.session_id)
    addOrRemoveCoin(user[0].pteroid,config.coins.reward)
    res.send({response: "Added coins"})
  }catch(err){}
})
app.get('/ads',async(req,res)=>{
  try{
  res.send({script: config.dash.adscript})
  }catch(err){

  }
})
setInterval(()=>{renewAll()},1000*60*60)


app.listen(port, () => {
  console.log(`Ultratyl listening on port ${port}`);
});
