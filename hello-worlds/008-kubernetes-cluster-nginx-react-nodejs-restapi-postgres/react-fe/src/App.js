import React, { useEffect, useState } from "react";
import axios from "axios";

const api_url = process.env.NODE_MS_API + "healthcheck"

export default function App() {
  const [healthCheck, setHealthCheck] = useState(false);
  useEffect(() => {

    //get user details from github using access token token received through oauth
    //    .get("http://localhost:9001/healthcheck", {
    axios
      .get(api_url, {
        headers: {
          Authorization: "none",
        },
      })
      .then((res) => {
        console.log(`response is`);
        console.dir(res.data);

        console.log(`setHealthCheck(true) done`);
        setHealthCheck(res.data);
      })
      .catch((error) => {
        console.log("vi error " + error);
        var mystr = "Api err" + error;
        setHealthCheck(mystr);
      });
  }, []);

  console.log("useEffect done");
  return (<h1>Hello World from App.js!! <br /><br />Nodejs microservice api url <br /> {api_url} <br /> <br/> {healthCheck} </h1>);


}
