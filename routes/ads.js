function loadAdScript() {
    fetch('/ads')
        .then(response => response.json())
        .then(data => {
            if (data.script) {
                let existingScript = document.head.querySelector('script#ads-script');
                if (existingScript) {
                    existingScript.innerHTML = data.script;
                } else {
                    const scriptElement = document.createElement('script');
                    scriptElement.id = 'ads-script';
                    scriptElement.innerHTML = data.script;
                    document.head.appendChild(scriptElement);
                }
            }
        })
        .catch(error => {
            console.error('Error loading ad script:', error);
        });
}

loadAdScript();