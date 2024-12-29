
const userinfo = async () => {
    return await fetch('/getuser').then(res => res.json()).catch(err => console.error('Error:', err));
    };
const pass = async () => {
    return await fetch('/changepass').then(res => res.json()).catch(err => console.error('Error:', err));
    };
    

const html = async () =>{
const user = await userinfo();

document.getElementById("email").value = user[0].email;
document.getElementById('username').value = user[0].user;


}
const changepass = async () =>{
    const newpass = await pass();
    document.getElementById('password').value = newpass.newpass;
}
html()