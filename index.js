const express = require('express');
const path = require('path');
const app = express();
const discordauth = require("./discordauth")
const port = 3000;

// Serve static files from the 'routes' directory
app.use(express.static('routes'));

// Route to serve the login.html file
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
