# Nodejs webapp - hello world level
This is a very simple node express server application.  Users 9001 as default port.

Node version used is v14.17.5

```
npm install
npm run start
```

http://localhost:9001 will serve the microservices.

send POST request to http://localhost:9001/auth with below body to get authenticated.
{
    "email": "abc1@abc.com",
    "password": "pw1"
}

After authentication use http://localhost:9001/api/v1/sensitive-content to access sensitive content from the same browser.  Auth token and auth session are stored in http-only cookies and used by the nodejs app.

Try http://localhost:9001/api/v1/hello-with-name/:name with or without authentication.  It'll serve some content.