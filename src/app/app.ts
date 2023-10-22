import flash from 'connect-flash';
import csurf from 'csurf';
import express, { NextFunction, Request, Response } from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import expressWinston from 'express-winston';
import winston from 'winston';

import { Config } from '../config/config.js';
import { HomeController } from '../home/controllers/home.controller.js';
import { HomeService } from '../home/services/home.service.js';
import { SigninController } from '../id/controllers/signin.controller.js';
import { PasswordService } from '../id/services/password.service.js';
import { SigninService } from '../id/services/signin.service.js';
import { UserRepo } from '../id/services/user.repo.js';

export const defaultConfig: Config = {
  port: 8080,
  sessionSecret: 'secret',
  homePath: '/home',
  signinPath: '/signin',
};

export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export function createApp(cfg: Config, users: UserRepo) {
  const app = express();

  // Logging.
  app.use(expressWinston.logger({ winstonInstance: logger }));

  // Support requests of "application/json".
  app.use(express.json());
  // Support requests of "application/x-www-form-urlencoded"
  app.use(express.urlencoded({ extended: true }));
  // Support requests of "application/octet-stream".
  // app.use(express.raw());
  // Support requests of "multipart/form-data";
  // const multer  = require('multer');
  // const upload = multer();

  // Serve static files.
  // app.use(express.static('public'));

  // Use a session middleware.
  app.use(
    session({
      name: 'expressapp-session',
      secret: cfg.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // maxAge: ...,
        // secure: true, // true in the production environment
        // rolling: ...,
        // store: ...,
      },
    }),
  );
  // Use a flash middleware.
  app.use(flash());

  // Use handlerbars as a template engine.
  app.engine('handlebars', engine());
  app.set('view engine', 'handlebars');

  // Enable CORS.
  // import cors from 'cors';
  // app.use(cors());

  // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
  // import cookieParser from 'cookie-parser';
  // app.use(cookieParser());

  // DB integration.
  // import { PrismaClient } from '@prisma/client';
  // const prisma = new PrismaClient();

  // Secure HTTP response headers.
  // import helmet from 'helmet';
  // app.use(helmet());

  // OpenAPI: TODO.

  const pwdSvc = new PasswordService();
  const signinSvc = new SigninService(pwdSvc, users);
  const homeSvc = new HomeService(users);
  const signinCtr = new SigninController(cfg, signinSvc);
  const homeCtr = new HomeController(cfg, homeSvc);

  app.get(cfg.homePath, homeCtr.home.bind(homeCtr));
  // TODO: csurf has been deprecated.
  const csrfProtection = csurf();
  app.get(cfg.signinPath, csrfProtection, signinCtr.signinPage.bind(signinCtr));
  app.post(cfg.signinPath, csrfProtection, signinCtr.signin.bind(signinCtr));

  app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  return app;
}
