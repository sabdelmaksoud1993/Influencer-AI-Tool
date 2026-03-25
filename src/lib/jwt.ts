import { SignJWT, jwtVerify } from 'jose';

const secretValue = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!secretValue) {
  console.error('FATAL: AUTH_SECRET or NEXTAUTH_SECRET must be set');
}
const JWT_SECRET = new TextEncoder().encode(secretValue || 'MISSING_SECRET');

export interface TokenPayload {
  id: string;
  name: string;
  role: 'member' | 'venue' | 'admin';
  accessCode?: string;
  email?: string;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(request: Request): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}
