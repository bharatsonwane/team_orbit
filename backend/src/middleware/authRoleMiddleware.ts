import { Request, Response, NextFunction } from 'express';
import { validateJwtToken } from '../utils/authHelper';

export interface AuthenticatedRequest extends Request {
  user?: JwtTokenPayload;
}

export interface JwtTokenPayload {
  userId: number;
  email: string;
  userRoles: Array<{
    id: number;
    label: string;
    lookupTypeId: number;
  }>;
}

export const authRoleMiddleware = (...allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const bearerToken = req.headers['authorization'];

    if (!bearerToken) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    try {
      // if the token is in the format "Bearer <token>", extract the token if not user the token as is
      const token = bearerToken.split(' ')?.[1] || bearerToken;

      // Validate the token
      const decodedJwt = (await validateJwtToken(token)) as JwtTokenPayload;
      req.user = decodedJwt;

      // Extract user roles from the decodedJwt token
      const userRoles =
        typeof decodedJwt === 'object' ? decodedJwt?.userRoles : null;

      // If no specific roles are required, proceed to the next middleware
      if (allowedRoles.length === 0) {
        next();
        return;
      }

      if (
        !userRoles ||
        !userRoles.some((role: { label: string }) =>
          allowedRoles.includes(role.label)
        )
      ) {
        res
          .status(403)
          .json({ message: 'Access forbidden: Insufficient permissions.' });
        return;
      }

      // Proceed to the next middleware
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token.' });
      return;
    }
  };
};
