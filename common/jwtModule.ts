import jwt, { JwtPayload } from "jsonwebtoken";

// TODO: dotenv 불러와야할지도?

class JwtModule {
  // TODO: sign, verify, decode 모듈화
  // authService, authMiddleware에서 사용되는 중임.

  static signToken = (payload: any, expireTime: string | number) => {
    const token = jwt.sign(payload, process.env.JWT_KEY as string, {
      expiresIn: expireTime,
    });

    return token;
  };
}

export default JwtModule;
