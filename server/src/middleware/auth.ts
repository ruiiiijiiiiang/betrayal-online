import { ExtendedError, Socket } from "socket.io";
import jwksClient from 'jwks-rsa';
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken';
import { MAccount, AccountModel } from '../models';

export const createAuthMiddleware = () => {
    return async (socket: Socket, next: (err?: ExtendedError) => void) => {
        try {
            const token = (socket.handshake.auth && (socket.handshake.auth as any).token) ||
                (socket.handshake.headers && (socket.handshake.headers as any).authorization) || null;
            if (!token) return next(new Error('unauthorized'));

            const payload = await verifyToken(token as string);
            if (!payload) return next(new Error('unauthorized'));

            socket.data.account = payload;

            await AccountModel.updateOne({ sub: payload.sub }, payload, { upsert: true })

            next();
        } catch (err) {
            console.error('Auth error in socket connection:', err);
            next(new Error('unauthorized'));
        }
    }
}

const getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
    if (!header.kid) return callback(new Error('No KID in token header'));

    const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;

    if (!AUTH0_DOMAIN) {
        console.warn('AUTH0_DOMAIN not set; JWT verification will fail until configured.');
    }

    const client = jwksClient({
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    });

    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err as Error);
        const signingKey = (key as any).getPublicKey ? (key as any).getPublicKey() : (key as any).publicKey;
        callback(null, signingKey);
    });
}

const verifyToken = async (token: string): Promise<JwtPayload & MAccount> => {
    const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;

    if (!AUTH0_DOMAIN) {
        console.warn('AUTH0_DOMAIN not set; JWT verification will fail until configured.');
    }

    return new Promise((resolve, reject) => {
        try {
            const bare = getTokenFromAuthHeader(token);
            jwt.verify(
                bare,
                getKey as any,
                {
                    algorithms: ['RS256'],
                },
                (err, decoded) => {
                    if (err) return reject(err);
                    resolve(decoded as JwtPayload & MAccount);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}

const getTokenFromAuthHeader = (authorization: string) => {
    if (authorization.startsWith('Bearer ')) return authorization.slice(7);
    return authorization;
}
