import { PasswordService } from '../id/services/password.service.js';
import { UserRepo } from '../id/services/user.repo.js';

export interface AuthorizeRequest {
  // OAuth 2.0
  responseType: string;
  clientId: string;
  redirectUri?: string;
  scope?: string[];
  state?: string;

  // OAuth 2.0 Multiple Response Type Encoding Practices
  response_type?: string;

  // OpenID Connect 1.0
  nonce?: string;
  display?: string;
  prompt?: string[];
  maxAge?: number;
  uiLocales?: string[];
  IdTokenHint?: string;
  loginHint?: string;
  acrValues?: string[];

  // Proof Key for Code Exchange by OAuth Public Clients
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export class OpService {
  async authorize(req: AuthorizeRequest) {
    return {};
  }
}
