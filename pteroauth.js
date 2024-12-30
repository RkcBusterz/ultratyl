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
            first_name: data.global_name,
            last_name: "#",
            password: crypto.randomBytes(16).toString('hex'),
            root_admin: false,
            language: "en"
        })})
    const resjson = await response.json()
    return resjson
}
}

const createServer = async (server) =>{
const allocation = Math.floor(Math.random() * 30)


if(server.memory <= config.Pterodactyl.specifications.memory && server.cpu <= config.Pterodactyl.specifications.cpu && server.storage <= config.Pterodactyl.specifications.storage){

const data = await fetch(config.Pterodactyl.panel_url+"/api/application/servers", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer "+config.Pterodactyl.api_key
  },
  credentials: "include",
  body: JSON.stringify({
    name: server.name,
    user: server.user,
    egg: 1,
    docker_image: "ghcr.io/pterodactyl/yolks:java_21",
    startup: "java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}",
    environment: {
      PAPER_VERSION: "latest",
      SERVER_JARFILE: "server.jar",
      BUILD_NUMBER : "latest"
    },
    limits: {
      memory: server.memory,
      swap: 0,
      disk: server.storage,
      io: 500,
      cpu: server.cpu
    },
    feature_limits: {
      databases: 5,
      backups: 1
    },
    allocation: {
      default: allocation
    }
  })
})

const datajson = await data.json()
return datajson
}else{return "Your input exceeds our current limits"}

}

async function getServers(data) {

  const url = config.Pterodactyl.panel_url+"/api/application/servers";
  var userid;
  if(data.id == undefined && data.email != undefined){
  const user = await getUser(data.email)
   userid = user.id
  }else{
     userid = data.id;
  }
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+config.Pterodactyl.api_key
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const specificServers = await data.data.filter(server => server.attributes.user === userid);
    return specificServers
    return data; 
  } catch (error) {
    return error
  }
}

const changePassword = async (email) => {
  const newpass = crypto.randomBytes(8).toString('hex')
  const user = await getUser(email);
  const id = user.id;
  fetch(config.Pterodactyl.panel_url+"/api/application/users/"+id, {
    method: "PATCH",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer "+config.Pterodactyl.api_key
    },
    credentials: "include",  // Ensures the session cookie is sent
    body: JSON.stringify({
      email: user.email,
      username: user.username,
      first_name : user.first_name,
      last_name: user.last_name,
      password: newpass
    })
  })
  .then(response => response.json())
  .then(data => {
  })
  .catch((error) => {
    console.error("Error:", error);
  });

  return {newpass: newpass};
}

async function deleteServer(id) {
  const serverId = id; // Replace with the actual server ID
  const apiKey = config.Pterodactyl.api_key; // Replace with your actual API key

  const url = config.Pterodactyl.panel_url+`/api/application/servers/${serverId}`;

  try {
      const response = await fetch(url, {
          method: 'DELETE',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          }
      });

      if (!response.ok) {
          throw new Error('Failed to delete the server');
      }

      const result = await response;
      return result;
  } catch (error) {
      console.error('Error deleting server:', error);
  }
}

module.exports = {addUser,config,getUser,crypto,getServers,createServer,changePassword,deleteServer}
