import express from 'express';
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ credentials: true, origin: true }));

app.get("/oauth/successcallback", (req, res) => {

    //OAuth with GITHUB is scuessful
    //access code is in req.query.code
    //Issue request to GITHUB to get token

    console.dir (req.query);
    console.log(`access code received is ${req.query.code}`);
    console.log(`axios req issued to  ${process.env.GITHUB_OAUTH_URL}?client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}&client_secret=${process.env.GITHUB_OAUTH_CLIENT_SECRET}&code=${req.query.code}`);
  axios({
    method: "POST",
    url: `${process.env.GITHUB_OAUTH_URL}?client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}&client_secret=${process.env.GITHUB_OAUTH_CLIENT_SECRET}&code=${req.query.code}`,
    headers: {
      Accept: "application/json",
    },
  }).then((response) => {
    console.log (`response received access token ${response.data.access_token} `);
    console.log (`redirected to the client http://localhost:3000?access_token_via_backchannel=${response.data.access_token}`)
    res.redirect(
      `http://localhost:3000?access_token_via_backchannel=${response.data.access_token}`
    );
  });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});

async function closeGracefully (signal) {
	console.log ("I'll close gracefully!....\n");
	process.exit (1);
}
process.on('SIGINT', closeGracefully);