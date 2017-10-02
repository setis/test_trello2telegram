import {TrelloOAuth} from "./oauth";
import {RequestPromise, RequestPromiseOptions} from 'request-promise-native';
import {CoreOptions, RequestAPI, RequiredUriUrl} from "request";
import throttle = require("p-throttle");
import requestPromise = require('request-promise-native');

const BASE_URL = 'https://api.trello.com';

export class TrelloApi {
    key: string;
    token: string;
    oauth?: TrelloOAuth;
    options?: CoreOptions;
    config: CoreOptions;
    loginCallback?: string;
    appName?: string;

    constructor(key: string, token: string, oauth?: {
        loginCallback: string,
        appName: string
    }, request: CoreOptions = {}) {
        if (token === undefined || key === undefined) {
            throw new Error(`not found token or key`);
        }
        this.key = key;
        this.token = token;

        if (oauth !== undefined) {
            this.loginCallback = oauth.loginCallback;
            this.appName = oauth.appName;
            this.oauth = new TrelloOAuth(this.key, this.token, oauth.loginCallback, oauth.appName);
        }
        this.limit();

    }

    webhooksList() {
        return this.make().get(`${BASE_URL}/1/tokens/${this.token}/webhooks`, {
            qs: {
                key: this.key,
                token: this.token
            }
        });
    }

    webhooksAdd(id: string, url?: string, description: string = '') {
        return this.make().post(`${BASE_URL}/1/webhooks`, {
            form: {
                description: description,
                callbackURL: url ? url : this.loginCallback,
                idModel: id,
                key: this.key,
                token: this.token
            }
        })
    }

    webhooksToggle(id: string) {
        return this.make().get(`${BASE_URL}/1/webhooks/${id}/active`, {
            qs: {
                key: this.key,
                token: this.token
            }
        });
    }

    webhooksRemove(id: string) {
        return this.make().del(`${BASE_URL}/1/webhooks/${id}`, {
            qs: {
                key: this.key,
                token: this.token
            }
        })
    }

    membersBoards(id: string) {
        return this.make().get(`${BASE_URL}/1/members/${id}/boards`, {
                qs: {
                    key: this.key,
                    token: this.token
                }
            }
        );

    }

    members(id: string) {
        return this.make().get(`${BASE_URL}/1/members/${id}`, {
                qs: {
                    key: this.key,
                    token: this.token
                }
            }
        );

    }
    cards(id: string) {
        return this.make().get(`${BASE_URL}/1/cards/${id}`, {
                qs: {
                    key: this.key,
                    token: this.token
                }
            }
        );

    }


    protected limit() {
        const list = ['constructor', 'oauth', 'make', 'limit'];
        let methods = Object.keys(this).filter(value => typeof value === 'function').filter(value => list.indexOf(value) === -1);
        methods.forEach(method => {
            this[method] = throttle(this[method], 100, 10e3);
        });
    }

    protected make(): RequestAPI<RequestPromise, RequestPromiseOptions, RequiredUriUrl> {
        if (this.config) {
            this.config = {
                headers: {
                    'User-Agent': 'request-trello-api',
                    'Content-Type': 'application/json'
                },
                // useQuerystring:false,
                // baseUrl: BASE_URL,
                json: true,
                gzip: true,
                ...this.options,
                ...(this.oauth) ? {oauth: this.oauth} : {}
            };
        }

        return requestPromise.defaults(this.config);
    }

}