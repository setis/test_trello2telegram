import express = require('express');

import favicon = require('serve-favicon');
import  winston = require('winston');
import expressWinston = require('express-winston');
import oauth_trello from './oauth';
import webhook_trello from './webhook';
import {NextFunction, Request, Response} from "express";
import {join} from 'path';
import bodyParser = require('body-parser');

const app = express();
app.use(favicon(join(__dirname, 'public', 'favicon.ico')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json({
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}} {{req.ip}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
        return false;
    } // optional: allows to skip some log messages based on request and/or response
}));
app.use('/oauth/trello', oauth_trello);
app.use('/webhook/trello', webhook_trello);
const server = app.listen(3000, function () {
    console.log('Server up and running...🏃🏃🏻');
    console.log("Listening on port %s", server.address().port);
});
