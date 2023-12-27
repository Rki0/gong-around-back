import jwt, { JwtPayload } from "jsonwebtoken";

import CustomError from "../errors/customError";

interface JwtCustomPayload extends JwtPayload {
  userId: string;
  nickname: string;
}

class JwtModule {
  static signToken = (payload: any, expireTime: string | number) => {
    const token = jwt.sign(payload, process.env.JWT_KEY as string, {
      expiresIn: expireTime,
    });

    return token;
  };

  static decodeToken = (token: string) => {
    const decodedToken = jwt.decode(token) as JwtCustomPayload;

    if (!decodedToken) {
      throw new CustomError(403, "Invalid decoded token.");
    }

    return decodedToken;
  };

  static verifyToken = (token: string) => {
    jwt.verify(token, process.env.JWT_KEY as string);
  };
}

export default JwtModule;
