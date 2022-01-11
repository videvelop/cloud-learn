
Start the nodejs server for backchannel authentication.  Before starting, remember to fill up sample.env with your credentials and rename the file as .env.
```
cd serverapp
npm i
npm run start
```


The below avoids cors issues
```
npm install -g local-cors-proxy
lcp --proxyUrl https://api.github.com/
```

When this lcp proxy is running, a url called as http://localhost:8010/proxy/user will go as https://api/github.com/user.

Start the Reactjs client.
```
cd clientapp
npm i
npm run start
```