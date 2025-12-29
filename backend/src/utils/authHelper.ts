import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { envVariable } from "@src/config/envVariable";

// JWT token payload interface

export interface JwtTokenPayload {
  /* [key: string]: any; */
  userId: number;
  email: string;
  isPlatformUser: boolean;
}

// AUTH
export const getHashPassword = async (password: string): Promise<string> => {
  const hashPassword = await bcrypt.hash(password, 12);
  return hashPassword;
};

export const validatePassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  const isPasswordValid = await bcrypt.compare(password, hashPassword);
  return isPasswordValid;
};

export const createJwtToken = (tokenDataObject: JwtTokenPayload): string => {
  const jwtToken = jwt.sign({ ...tokenDataObject }, envVariable.JWT_SECRET, {
    expiresIn: 24 * 60 * 60, // 24 hours
  });
  return jwtToken;
};

export const validateJwtToken = (token: string): JwtTokenPayload => {
  // verify a token symmetric - synchronous
  const decodedToken = jwt.verify(
    token,
    envVariable.JWT_SECRET
  ) as JwtTokenPayload;
  return decodedToken;
};
