const config = require("./settings.json");

const getUser = async (email) => {
  const response = await fetch(config.Pterodactyl.panel_url + "/api/application/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.Pterodactyl.api_key}`,
      "Content-Type": "application/json",
      Accept: "Application/vnd.pterodactyl.v1+json",
    },
  });

  const resjson = await response.json();
  const specificUser = resjson.data.find(user => user.attributes.email === email);

  return specificUser.attributes;
};

