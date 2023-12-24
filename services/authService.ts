import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

import User from "../models/User";
import connectRedis from "../utils/redis";
import BcryptModule from "../common/bcryptModule";
import UserDB from "../common/userDB";
import JwtModule from "../common/jwtModule";

interface UserInfo {
  nickname: string;
  email: string;
  password: string;
}

interface LogInUserInfo {
  email: string;
  password: string;
}

interface JwtCustomPayload extends JwtPayload {
  userId: string;
  nickname: string;
}

class AuthService {
  signUp = async (user: UserInfo) => {
    const { nickname, email, password } = user;

    const existingUser = await UserDB.getByEmail(email);

    if (existingUser) {
      throw new Error("이미 가입된 이메일입니다.");
    }

    const hashedPassword = await BcryptModule.hashPassword(password);

    const createdUser = new User({
      nickname,
      email,
      password: hashedPassword,
    });

    try {
      await createdUser.save();
    } catch (err) {
      console.log(err);
      throw new Error("유저 등록 중 에러가 발생했습니다.");
    }
  };

  logIn = async (user: LogInUserInfo) => {
    const { email, password } = user;

    const existingUser = await UserDB.getByEmail(email);

    if (!existingUser) {
      throw new Error("존재하지 않는 유저입니다.");
    }

    await BcryptModule.checkPassword(password, existingUser.password);

    const accessToken = JwtModule.signToken(
      {
        userId: existingUser.id,
        nickname: existingUser.nickname,
      },
      "30m"
    );

    const refreshToken = JwtModule.signToken({}, "14d");

    // cache the refresh token to Redis
    const redisClient = await connectRedis();

    try {
      // cache time : same with refresh token's expired time : 14d
      await redisClient.set(existingUser.id, refreshToken, {
        EX: 60 * 60 * 24 * 14,
      });
    } catch (err) {
      throw new Error("리프레쉬 토큰 캐싱 실패");
    }

    await redisClient.disconnect();

    return {
      userId: existingUser.id,
      nickname: existingUser.nickname,
      accessToken,
      refreshToken,
    };
  };

  logOut = async (userId: string) => {
    const redisClient = await connectRedis();

    let isRefreshTokenExist;

    try {
      isRefreshTokenExist = await redisClient.get(userId);
    } catch (err) {
      console.log(err);
      throw new Error("리프레쉬 토큰 검색 실패");
    }

    if (!isRefreshTokenExist) {
      await redisClient.disconnect();
      return;
    }

    try {
      await redisClient.del(userId);
    } catch (err) {
      throw new Error("리프레쉬 토큰 삭제 실패");
    }

    await redisClient.disconnect();
    return;
  };

  reSignAccessToken = async (
    expiredAccessToken: string,
    refreshToken: string
  ) => {
    const decodedAccessToken = jwt.decode(
      expiredAccessToken
    ) as JwtCustomPayload;

    if (!decodedAccessToken) {
      throw new Error("Decoding Access Token failed");
    }

    try {
      // verify refresh token
      jwt.verify(refreshToken, process.env.JWT_KEY as string);
    } catch (err) {
      // case : refresh token expired
      if (err.message === "jwt expired") {
        const redisClient = await connectRedis();

        let isRefreshTokenExist;

        try {
          isRefreshTokenExist = await redisClient.get(
            decodedAccessToken.userId
          );
        } catch (err) {
          console.log(err);
          throw new Error("리프레쉬 토큰 검색 실패");
        }

        if (!isRefreshTokenExist) {
          await redisClient.disconnect();
          throw new Error("리프레쉬 토큰 없음.");
        }

        try {
          await redisClient.del(decodedAccessToken.userId);
        } catch (err) {
          throw new Error("리프레쉬 토큰 삭제 실패");
        }

        await redisClient.disconnect();
      }

      throw new Error(err.message);
    }

    // case : refresh token not expired
    // re-generate access token
    const newAccessToken = JwtModule.signToken(
      {
        userId: decodedAccessToken.userId,
        nickname: decodedAccessToken.nickname,
      },
      "30m"
    );

    const newRefreshToken = JwtModule.signToken(
      {
        // date: Date.now(),
      },
      "14d"
    );

    // cache the refresh token to Redis
    const redisClient = await connectRedis();

    try {
      // cache time : same with refresh token's expired time : 14d
      await redisClient.set(decodedAccessToken.userId, newRefreshToken, {
        EX: 60 * 60 * 24 * 14,
      });
    } catch (err) {
      throw new Error("리프레쉬 토큰 캐싱 실패");
    }

    await redisClient.disconnect();

    return {
      newAccessToken,
      newRefreshToken,
    };
  };
}

export default AuthService;
