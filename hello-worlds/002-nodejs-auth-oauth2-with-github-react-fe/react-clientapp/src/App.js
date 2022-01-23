
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const GITHUB_OAUTH_CLIENT_ID = "a5b3c833c88183daf88d";
const GITHUB_OAUTH_SUCCESS_CALLBACK = "/oauth/successcallback";
//request URL for auth grant
const GITHUB_URL_FOR_LOGIN = `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&redirect_uri=http://localhost:9000${GITHUB_OAUTH_SUCCESS_CALLBACK}`;

// to avoid cors issues, run a proxy using npm install -g local-cors-proxy && lcp --proxyUrl https://api.github.com/
const GITHUB_LOCAL_PROXY_URL = "http://localhost:8010/proxy/user"
const GITHUB_NOPROXY_URL = "https://api.github.com/user";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get(
      "access_token_via_backchannel"
    );

    //get user details from github using access token token received through oauth
    axios
      .get(GITHUB_LOCAL_PROXY_URL, {
        headers: {
          Authorization: "token " + token,
        },
      })
      .then((res) => {
        console.log(`data ${GITHUB_NOPROXY_URL}/user from is=====`);
        console.dir(res.data);
        setUser(res.data);
        setLoggedIn(true);
        console.log(`setLoggedIn(true) done`);
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
            Sign in using {GITHUB_URL_FOR_LOGIN}
          </a>
          <p>That sign-in link issues me github login page and if I successfully log in, github sends authcode to my backend server.  </p>
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
