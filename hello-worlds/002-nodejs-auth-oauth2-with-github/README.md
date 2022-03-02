This is an implementation of OAuth2.0 Authorization Code flow.

Prereq:
1. Go to github.com and create OAuth Apps by accessing Settings -> Developer settings -> Oauth Apps.  https://github.com/settings/developers

Note the Client ID and Client secrets.

Auth Control Flow:
1. when client is invoked using http://localhost:3000 , user is shown with sign-in link.  When the user clicks, below github URL is invoked with client_id and redirect_uri.  https://github.com/login/oauth/authorize?client_id=a5b3c833c88183daf88d&redirect_uri=http://localhost:9000/oauth/successcallback
2. github.com, on receiving this request, since client_id is valid, it'll show the UI to sign-in to the user.  If user gives valid credentials, then access_code is sent to redirect_uri.
3. the server side, on receiving the get request for http://localhost:9000/oauth/successcallback , sends client_secret + client_id + access_code to "https://github.com/login/oauth/access_token".  github.com will return back with access token.
4. server side invokes client with the access_token.
http://localhost:3000/?access_token=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
5. If access_token is present in the client side, it is understood as the user is authenticated provided this access_token is validated by github.

Serer:
1. Copy sample.env as .env.
2. Fillup the below values
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
3. Start the nodejs server for backchannel authentication.  
```
cd serverapp
npm i
npm run start
```

Proxy for CORS:
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