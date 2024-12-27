const config = require("./settings.json");
const crypto = require("crypto")
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
try{
  return specificUser.attributes;}
  catch{return undefined}
};


const addUser = async (data) =>{
if(getUser(data.email) == undefined){

}else{
    const response = await fetch(config.Pterodactyl.panel_url+"/api/application/users",{
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.Pterodactyl.api_key}`,
            "Content-Type": "application/json",
            Accept: "Application/vnd.pterodactyl.v1+json",
        },
        body: JSON.stringify({
            external_id: data.username,
            username: data.username,
            email: data.email,
            first_name: data.username,
            last_name: "#",
            password: crypto.randomBytes(16).toString('hex'),
            root_admin: false,
            language: "en"
        })})
    const resjson = await response.json()
    return resjson
}
}

module.exports = {addUser,config,getUser,crypto,}