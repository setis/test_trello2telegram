const Trello_OAuth_Request_Url = "https://trello.com/1/OAuthGetRequestToken";
const Trello_OAuth_Access_Url = "https://trello.com/1/OAuthGetAccessToken";
const Trello_OAuth_Authorize_Url = "https://trello.com/1/OAuthAuthorizeToken";
import {OAuth} from "oauth";

export class TrelloOAuth {
    app_name: string;
    oauth: any;
    // oauth_token?: string;
    // oauth_token_secret?: string;
    // oauth_access_token?: string;
    // oauth_access_token_secret?: string;

    constructor(key, secret, loginCallback, appName) {
        this.oauth = new OAuth(Trello_OAuth_Request_Url, Trello_OAuth_Access_Url, key, secret, "1.0", loginCallback, "HMAC-SHA1");
        this.app_name = appName;
    }

    getRequestToken(callback: (error?: Error, result?: {
        oauth_token: string,
        oauth_token_secret: string,
        redirect: string
    }) => void): void {

        this.oauth.getOAuthRequestToken((error, token, tokenSecret, results) => {
            console.log(error, token, tokenSecret, results);
            if (error) {
                return callback(error, null);
            }
            // this.oauth_token = token;
            // this.oauth_token_secret = tokenSecret;
            callback(null, {
                oauth_token: token,
                oauth_token_secret: tokenSecret,
                redirect: `${Trello_OAuth_Authorize_Url}?oauth_token=${token}&name=${this.app_name}`
            });
        });
    }

    getAccessToken(data: {
        oauth_token: string,
        oauth_token_secret: string,
        oauth_verifier: string
    }, callback: (error?: Error, result?: {
        oauth_token: string,
        oauth_token_secret: string,
        oauth_access_token: string,
        oauth_access_token_secret: string
    }) => void): void {
        this.oauth.getOAuthAccessToken(data.oauth_token, data.oauth_token_secret, data.oauth_verifier, function (error, accessToken, accessTokenSecret, results) {
            if (error) {
                return callback(error, null);
            }
            // this.oauth_access_token = accessToken;
            // this.oauth_access_token_secret = accessTokenSecret;
            callback(null, {
                oauth_token: data.oauth_token,
                oauth_token_secret: data.oauth_token_secret,
                oauth_access_token: accessToken,
                oauth_access_token_secret: accessTokenSecret
            });
        });
    }
}