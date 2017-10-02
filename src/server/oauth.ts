import {IRouter, NextFunction, Request, Response, Router} from 'express';
import * as express from "express";
import {OAuth} from "oauth";

// import {TrelloOAuth} from "../trello/oauth";

const config = require('../config.json').oauth.trello;
let routing:Router = express.Router({mergeParams: false});
const Trello_OAuth_Request_Url = "https://trello.com/1/OAuthGetRequestToken";
const Trello_OAuth_Access_Url = "https://trello.com/1/OAuthGetAccessToken";
const Trello_OAuth_Authorize_Url = "https://trello.com/1/OAuthAuthorizeToken";

// const oauth: TrelloOAuth  = new TrelloOAuth(config.key, config.secret, config.url, config.name);
const oauth = new OAuth(Trello_OAuth_Request_Url, Trello_OAuth_Access_Url, config.key, config.secret, "1.0A", config.url, "HMAC-SHA1");
const oauth_secrets: Map<string, {
    secret: string,
    time: number
}> = new Map();
setInterval(() => {
    let time = (new Date()).getTime();
    let offset = 60e3;
    oauth_secrets.forEach((value, key2) => {
        if ((time - value.time) > offset) {
            oauth_secrets.delete(key2);
        }
    })
}, 5 * 60e3).unref();


routing.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send("<h1>Oh, hello there!</h1><a href='./trello/login'>Login with OAuth!</a>");
});
routing.get('/login', (req: Request, res: Response, next: NextFunction) => {
    oauth.getOAuthRequestToken(function (error, token, tokenSecret, results) {
        console.log(`in getOAuthRequestToken - token: ${token}, tokenSecret: ${tokenSecret}, resultes ${JSON.stringify(results)}, error: ${JSON.stringify(error)}`);
        if (error) {
            res.redirect('/oauth/trello');
            return;
        }

        oauth_secrets.set(token, {
            secret: tokenSecret,
            time: (new Date()).getTime()
        });
        res.redirect(`${Trello_OAuth_Authorize_Url}?oauth_token=${token}&name=${config.name}`);
    });

});
routing.get("/callback", (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.oauth_token;
    if (!oauth_secrets.has(token)) {
        res.json({error: `not found oauth_token`, status: 'fail'});
        return;
    }
    const tokenSecret = oauth_secrets.get(token).secret;
    const verifier = req.query.oauth_verifier;
    oauth.getOAuthAccessToken(token, tokenSecret, verifier, function (error, accessToken, accessTokenSecret, results) {
        // In a real app, the accessToken and accessTokenSecret should be stored
        console.log(`in getOAuthAccessToken - accessToken: ${accessToken}, accessTokenSecret: ${accessTokenSecret}, error: ${error}`);
        if (error) {
            res.json({error: error.message, status: 'fail'});
            return;
        }
        oauth_secrets.delete(token);
        res.json({
            response: {
                token: accessToken,
                secret: accessTokenSecret
            },
            status: 'success'
        })
    });


});
export default routing;