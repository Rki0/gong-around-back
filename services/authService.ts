import User from "../models/User";
import connectRedis from "../utils/redis";
import BcryptModule from "../common/bcryptModule";
import UserDB from "../common/userDB";
import JwtModule from "../common/jwtModule";
import CustomError from "../errors/customError";

import {
  SignUpUserInfo,
  DefaultUserInfo as LogInUserInfo,
} from "../types/auth";

class AuthService {
  signUp = async (user: SignUpUserInfo) => {
    const { nickname, email, password } = user;

    const existingUser = await UserDB.getByEmail(email);

    if (existingUser) {
      throw new CustomError(400, "이미 가입된 이메일입니다.");
    }

    const hashedPassword = await BcryptModule.hashPassword(password);

    const createdUser = new User({
      nickname,
      email,
      password: hashedPassword,
    });

    await createdUser.save();
  };

  logIn = async (user: LogInUserInfo) => {
    const { email, password } = user;

    const existingUser = await UserDB.getByEmail(email);

    if (!existingUser) {
      throw new CustomError(400, "존재하지 않는 유저입니다.");
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

    // cache time : same with refresh token's expired time : 14d
    await redisClient.set(existingUser.id, refreshToken, {
      EX: 60 * 60 * 24 * 14,
    });

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

    await redisClient.del(userId);

    await redisClient.disconnect();
  };

  reSignAccessToken = async (
    expiredAccessToken: string,
    refreshToken: string
  ) => {
    const decodedAccessToken = JwtModule.decodeToken(expiredAccessToken);

    try {
      // verify refresh token
      JwtModule.verifyToken(refreshToken);
    } catch (err) {
      // case : refresh token expired
      const redisClient = await connectRedis();

      await redisClient.del(decodedAccessToken.userId);

      await redisClient.disconnect();

      throw new CustomError(401, err.message);
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

    // cache time : same with refresh token's expired time : 14d
    await redisClient.set(decodedAccessToken.userId, newRefreshToken, {
      EX: 60 * 60 * 24 * 14,
    });

    await redisClient.disconnect();

    return {
      newAccessToken,
      newRefreshToken,
    };
  };
}

export default AuthService;
