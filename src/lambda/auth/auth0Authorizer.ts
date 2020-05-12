import 'source-map-support/register';
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';

import { verify, decode } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import axios from 'axios';
import { Jwt } from '../../auth/Jwt';
import { JwtPayload } from '../../auth/JwtPayload';
import { AuthorizationError } from '../../errors';

const logger = createLogger('auth0Authorizer');

const jwksUrl = process.env.AUTH0_JWKS_URL;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken: JwtPayload = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  if (jwt.header.alg !== 'RS256') {
    throw new AuthorizationError('Non valid signing algorithm');
  }

  const publicKey = await getPublicKey(jwt.header.kid);
  return verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;
}

interface JWKS {
  alg: string,
  kty: string,
  use: string,
  n: string,
  e: string,
  kid: string,
  x5t: string,
  x5c: Array<string>,
}
async function getPublicKey(kid: string): Promise<string> {
  const keys: Array<JWKS> = (await axios.get(jwksUrl)).data.keys;

  if (!keys || !keys.length) {
    throw new AuthorizationError('Could not find keys');
  }

  const signingKeys: Array<any> = keys.filter((key: JWKS) => (
    key.use === 'sig' &&
    key.kty === 'RSA' &&
    key.kid &&
    ((key.x5c && key.x5c.length) || (key.n && key.e))
  )).map(key => ({
    kid: key.kid, publicKey: certToPEM(key.x5c[0])
  }));

  if (!signingKeys.length) {
    throw new AuthorizationError('Could not find signing keys');
  }

  const signingKey = signingKeys.find(key => key.kid === kid);
  if (!signingKey) {
    throw new AuthorizationError(`Signing key not found for ${kid}`);
  }

  return signingKey.publicKey;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new AuthorizationError('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new AuthorizationError('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}

function certToPEM(cert: string) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
