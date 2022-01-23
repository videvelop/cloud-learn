import express, { application } from 'express';
import os from 'os';
import users from './model/users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import tokens from './model/jwttokens.js';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import usersessions from './model/usersessions.js';

dotenv.config();

const hostname = os.hostname();

const server_port = process.env.SERVER_PORT || 9001;
const allowedMethods = [
    "OPTIONS",
    "HEAD",
    "CONNECT",
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "TRACE"
];



const app = express();
var reqSeq = 0;
var reqSession = 0;

function mylog(logmsg) {
    console.log(`Req<${reqSeq}> H<${hostname}> T<${new Date().toISOString()}> session<${reqSession}> ${logmsg}`);
}

app.listen(server_port, () =>
    mylog(`Server started at port ${server_port}`)
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());


app.use(session({
    secret: process.env.SESSION_SECRET_KEY || "devsecret",

    //don't use default name
    //give your own name to avoid clients identifying the server
    //technology and attempting targeted attachs
    name: 'visession',

    // Forces the session to be saved
    // back to the session store
    resave: true,

    // If set true, forces a session that is "uninitialized"
    // to be saved to the store; we don't want empty sessions to be stored.
    // So, set it to false.
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour = 60min = 60min x 60 sec = 60min x 60sec x 1000 ms
        sameSite: true
    }
}));

app.use(cors({ origin: 'localhost' }));


app.use(function (req, res, next) {
    mylog(`Req entry point. URL=${req.originalUrl}; method=${req.method} :: reqSeq incremented - ${reqSeq++}`);

    mylog(`req session ${JSON.stringify(req.session)}`);
    console.dir(req.session);

    if (!allowedMethods.includes(req.method)) {
        mylog(`not allowed method used`);
        res.status(405).send(`${req.method} not allowed.`);
    }

    if (!req.session) {
        mylog(`no session yet...`);
    } else {
        reqSession = req.session.id;
        mylog(`session available: ${req.session.id}`);
    }

    if (!req.session.page_views) {
        req.session.page_views = 1;
    } else if (req.session.page_views) {
        req.session.page_views++;
        mylog(`session: ${req.session.id}; page_views: ${req.session.page_views}`);
    }


    next();
})

function destroy_session(req) {
    if (!req.session) {
        mylog(`Session does not exist; nothing to destroy`);
    } else {
        req.session.destroy((serr) => {
            if (serr) throw serr;
            mylog(`Session Destroyed`);
        });
    }
}

app.get('/logout', (req, res) => {
    if (!req.session) {
        mylog(`Session does not exist; logout not applicable`);
        res.status(200).send("logout not applicable as no login happened before");
        return;
    }

    if (req.session.isAuth) {
        req.session.isAuth = false;
        destroy_session(req);
        res.status(200).send("logged out");
        return;
    } else {

        mylog(`session exist. but no login yet.  so logout not applicable.`);
        res.status(200).send("session exist. but no login yet.  so logout not applicable.");
        return;
    }

});

// show a response
app.get('/', (req, res) => {
    mylog(`Processing URL ${req.baseUrl}`);
    res.send(`${req.session.page_views} Hello World!<br/> This will serve the following apis:<br/> api/v1/hello-with-name/{name}<br/> api/v1/sensitive-content <br/> /auth <br/>`);
});

// show a response
app.get('/api/v1/hello-with-name/:name', (req, res) => {
    if (!req.cookies || !req.cookies.secureCookie) {
        mylog(`no authentication yet. but it is fine`);
    }
    mylog(`Processing URL ${req.originalUrl} - Req.params: ${req.params.name}`);
    res.send(`Hello ${req.params.name} <br/> Date at server is ${Date.now()} <br/> Server host is ${hostname}`);
});


app.get('/api/v1/sensitive-content', (req, res) => {
    //verify token and then show the keys

    if (req.session.isAuth !== true) {
        mylog(`isAuth not set`);
        res.status(401).send(`auth verification error<br/>`);
        return;
    }

    try {
        auth_verify(req);
    } catch (err) {
        mylog(`sending 401 to client`);
        res.status(401).send(`unauthorized to get response from this api <br/>`);
        return;
    }

    res.status(200).send(`some sensitive-content: <br/>say the score points 879877 is a sensitive content for now...<br/>`);

});

function auth_verify(req) {
    if (!req.cookies || !req.cookies.jwttoken || req.session.isAuth !== true) {
        mylog(`required auth keys not found`);
        throw ("required auth keys not found");
    }

    //req.cookies.jwttoken verify
    jwt.verify(req.cookies.jwttoken, process.env.JWT_SECRET_KEY,
        function (err, decoded) {
            if (err) {
                mylog(`jwt.verify failed ${err}`)
                throw err;
            } else {
                mylog(`jwt.verify success `);
            }
        });
}

app.post('/auth', (req, res) => {
    mylog(`Processing URL ${req.originalUrl}<br/>req.params: ${req.params.name}<br/>req.body: ${req.body}`);
    //authenticate and send basic auth based JWT 
    try {
        const { email, password } = req.body;

        mylog(`req.body detail email ${email}  password ${password}`);

        if (!(email && password)) {
            res.status(400).send("email/password input is required");
            return;
        }

        const user = users.filter(entry => entry.email === email);

        mylog(`user ${user[0].id}  hash ${user[0].hash}`);

        // encryptedPassword = await bcrypt.hash(password, 10);

        const salt = bcrypt.getSalt(user[0].hash);
        mylog(`salt ${salt}`);
        //mylog (`salt exact string ${salt.split("$")[3].substring(0,21)}`);

        const userHash = bcrypt.hashSync(req.body.password, salt);
        mylog(`generated hash is ${userHash}`);
        mylog(`available hash is ${user[0].hash}`);

        bcrypt.compare(req.body.password, user[0].hash, function (err, res1) {
            if (err) {
                mylog("bcrypt err");
                res.status(500).send("some error");
            }
            if (res1) {
                mylog("bcrypt successful. passwords match");
                const token = jwt.sign(
                    { user_id: user[0].id, email, session: req.session.id },
                    process.env.JWT_SECRET_KEY,
                    {
                        expiresIn: "2h",
                    }
                );
                tokens[email] = token;


                mylog(`token created is ${token}; token stored ${tokens[email]}`);
                req.session.isAuth = true;
                res.status(200)
                    .cookie('jwttoken', token, { httpOnly: true })
                    //            .cookie('SameSite=Strict')
                    .json({ "auth": "success", "jwt": token });
            } else {
                mylog("bcrypt successful. passwords do NOT match")
                // response is OutgoingMessage object that server response http request
                // return response.json({success: false, message: 'passwords do not match'});
                res.status(400).json({ "auth": "failed" });
            }
        });
    } catch (err) {
        console.log(err);
    }
});

async function closeGracefully (signal) {
	console.log ("I'll close gracefully!....\n");
	process.exit (1);
}
process.on('SIGINT', closeGracefully);