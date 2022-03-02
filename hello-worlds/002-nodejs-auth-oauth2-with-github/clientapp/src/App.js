
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const GITHUB_OAUTH_CLIENT_ID = "a5b3c833c88183daf88d";
const GITHUB_OAUTH_SUCCESS_CALLBACK = "/oauth/successcallback";
const GITHUB_URL_FOR_LOGIN = `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&redirect_uri=http://localhost:9000${GITHUB_OAUTH_SUCCESS_CALLBACK}`;

//a url called as http://localhost:8010/proxy/user will go as https://api/github.com/user,
//provided a proxy is running in localhost as below
//lcp --proxyUrl https://api.github.com/
//lcp is an npm module.  It gives the proxy url http://localhost:8010/proxy/user for https://api.github.com/
//this proxy url helps to avoid cors issue when you test all client & server in localhost.
//request header with "origin"="localhost" cannot request resource from another domain api.github.com

//const GITHUB_LOCAL_PROXY_URL = "http://localhost:8010/proxy/user"
const GITHUB_NOPROXY_URL = "https://api.github.com/";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    //window.location.search provides query string..
    //here, query string is expected to have access_token with valid value
    const token = new URLSearchParams(window.location.search).get(
      "access_token"
    );

    console.log(window.location.search);
    //get user details from github using access token token received through oauth
    axios
      .get(GITHUB_NOPROXY_URL, {
        headers: {
          Authorization: "token " + token,
        },
      })
      .then((res) => {
        console.log("data is=====");
        console.dir(res.data);
        setUser(res.data);
        setLoggedIn(true);
      })
      .catch((error) => {
        console.log("error " + error);
      });
  }, []);

  console.log("useEffect done");


  return (
    <div className="App text-center container-fluid">
      {!loggedIn ? (
        <>

          <h1>Sign in with GitHub</h1>
          <a

            href={GITHUB_URL_FOR_LOGIN}
          >
            Sign in
          </a>
        </>
      ) : (
        <>
          <h1>Welcome!</h1>
          <p>
            This is a simple integration between OAuth2 on GitHub with Node.js. Github user name  received using token is is <br /><b>{user.name}</b>
          </p>


        </>
      )}
    </div>
  );
}

export default App;
