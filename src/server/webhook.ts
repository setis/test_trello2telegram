import * as express from 'express';
import {NextFunction, Request as RequestExpress, Response, Router} from 'express';
import {createHmac} from "crypto";
import cors = require('cors');
import bot  from './telegram';

let routing: Router = express.Router();
routing.use(
    cors({
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    }));

function base64Digest(secret: string, data: string): string {
    return createHmac('sha1', secret).update(data).digest('base64');
}

function isOriginTrello(request: RequestExpress, secret, callbackURL): boolean {
    var content = (request as any).rawBody + callbackURL;

    var doubleHash = base64Digest(secret, base64Digest(secret, content));
    var headerHash = base64Digest(secret, request.header('x-trello-webhook'));
    return doubleHash == headerHash;
}
routing.head('/', (req: RequestExpress, res: Response, next: NextFunction) => {
    res.status(200);
    res.end();
});
routing.post('/', (req: RequestExpress, res: Response, next: NextFunction) => {
    // console.log(isOriginTrello(req, "9475c8693e79c37fcac97259fb8f086b", req.url),verifyTrelloWebhookRequest(req, "9475c8693e79c37fcac97259fb8f086b", req.url));
    // if (!isOriginTrello(req, "9475c8693e79c37fcac97259fb8f086b", "http://136.169.237.1/webhook/trello")) {
    //     console.log('is not origin trello');
    //     res.status(403);
    //     res.end();
    //     return;
    // }
    console.log(req.body);
    let data = req.body;
    try {
        var event = data.action.type,
            model = data.model.name || data.model.fullName,
            user = data.action.memberCreator.fullName;
    } catch (e) {
        res.status(400);
        res.end();
        return;
    }

    bot.emit(event,data);
    res.status(200);
    res.end();

});
routing.use('/', (req: RequestExpress, res: Response, next: NextFunction) => {
    res.status(403);
    res.end();
});
export default routing;