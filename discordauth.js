const config = require("./settings.json")

const getAccessToken = async (code)=>{
try{
    const data = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: "http://localhost:3000/callback",
      });
  
      const response = await fetch(`https://discord.com/api/v10/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${config.Discord.CLIENT_ID}:${config.Discord.CLIENT_SECRET}`).toString('base64')}`,
        },
        body: data,
      });
      var resjson = await response.json()
      return resjson.access_token
    }catch{
      console.error("Invalid code")
    }
}

const fetchUser = async (code) => {
try{
    const data = await getAccessToken(code)
    try {
      const response = await fetch(`https://discordapp.com/api/users/@me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user:', error);
    }
}catch{
  console.error("Invalid access_code")
}
  };
  

  module.exports = {fetchUser, getAccessToken, config}