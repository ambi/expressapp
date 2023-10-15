export interface Config {
  port: number;
  sessionSecret: string;

  homePath: string;
  signinPath: string;
  authorizePath: string;
  tokenPath: string;
}
