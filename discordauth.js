const config = require("./settings.json");

const getAccessToken = async (code) => {
  try {
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${config.dash.url}/callback`,
    });

    const response = await fetch(`https://discord.com/api/v10/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${config.Discord.CLIENT_ID}:${config.Discord.CLIENT_SECRET}`).toString('base64')}`,
      },
      body: data,
    });

    const resjson = await response.json();
    if (!response.ok) {
      throw new Error(`Error getting access token: ${resjson.error || response.statusText}`);
    }

    return resjson.access_token;
  } catch (error) {
    console.error("Error in getAccessToken:", error.message);
    return null;
  }
};

const fetchUser = async (code) => {
  try {
    const token = await getAccessToken(code);
    if (!token) throw new Error("Invalid or missing access token");

    const response = await fetch(`https://discord.com/api/v10/users/@me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.status} - ${response.statusText}`);
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error in fetchUser:", error.message);
    return null;
  }
};

module.exports = { fetchUser, getAccessToken, config };
