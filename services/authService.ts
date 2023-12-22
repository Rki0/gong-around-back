import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User";
import connectRedis from "../utils/redis";
import BcryptModule from "../common/bcryptModule";
import UserDB from "../common/userDB";

interface UserInfo {
  nickname: string;
  email: string;
  password: string;
}

interface LogInUserInfo {
  email: string;
  password: string;
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

    let accessToken;

    try {
      accessToken = jwt.sign(
        {
          userId: existingUser.id,
          nickname: existingUser.nickname,
        },
        process.env.JWT_KEY as string,
        { expiresIn: "30m" }
      );
    } catch (err) {
      throw new Error("토큰 생성 실패");
    }

    // TODO: 이미 refreshToken이 redis에 존재하는 경우에는 발급하지 않아도 되지 않나..?
    // TODO: 로그아웃하고 로그인하는 경우와 그렇지 않은 경우 등 상황이 많은가..?

    let refreshToken;

    try {
      refreshToken = jwt.sign({}, process.env.JWT_KEY as string, {
        expiresIn: "14d",
      });
    } catch (err) {
      throw new Error("리프레쉬 토큰 생성 실패");
    }

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
}

export default AuthService;
