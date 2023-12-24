import jwt, { JwtPayload } from "jsonwebtoken";

// TODO: dotenv 불러와야할지도?

interface JwtCustomPayload extends JwtPayload {
  userId: string;
  nickname: string;
}

class JwtModule {
  // TODO: sign, verify, decode 모듈화
  // authService, authMiddleware에서 사용되는 중임.

  static signToken = (payload: any, expireTime: string | number) => {
    const token = jwt.sign(payload, process.env.JWT_KEY as string, {
      expiresIn: expireTime,
    });

    return token;
  };

  static decodeToken = (token: string) => {
    const decodedToken = jwt.decode(token) as JwtCustomPayload;

    if (!decodedToken) {
      throw new Error("Decoding Token failed");
    }

    return decodedToken;
  };
}

export default JwtModule;
