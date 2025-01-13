const servers = async () => {
return await fetch('/getservers').then(res => res.json()).catch(err => console.error('Error:', err));
};


const limits = async () => {
return await fetch('/limits').then(res => res.json()).catch(err => console.error('Error:', err));
};


const htmls = async () =>{
    const lim = await limits()
    const ser = await servers()

    if(ser.length == 0){
        document.getElementById("cpu").innerHTML = `0%/${lim.cpu}%`;
        document.getElementById("ram").innerHTML = `0MB/${lim.ram}MB`;
        document.getElementById("storage").innerHTML = `0MB/${lim.storage}MB`;
        document.getElementById("slots").innerHTML = `${ser.length}/${lim.slot}`;
    }else{
        var ramUsed = 0;
        var cpuUsed = 0;
        var storageUsed = 0;
        var slot = ser.length;
        for (let i = 0; i < ser.length; i++) {
            ramUsed = ramUsed + ser[i].attributes.limits.memory;
            cpuUsed = cpuUsed + ser[i].attributes.limits.cpu;
            storageUsed = storageUsed + ser[i].attributes.limits.disk;
        }
        console.log(ramUsed,cpuUsed,storageUsed)
        document.getElementById("cpu").innerHTML = `${cpuUsed}%/${lim.cpu}%`;
        document.getElementById("ram").innerHTML = `${ramUsed}MB/${lim.ram}MB`;
        document.getElementById("storage").innerHTML = `${storageUsed}MB/${lim.storage}MB`
        document.getElementById("slots").innerHTML = `${slot}/${lim.slot}`;
        console.log(`${lim.storage-storageUsed}, ${lim.ram-ramUsed}, ${lim.cpu-cpuUsed}`);
    }
}

htmls()