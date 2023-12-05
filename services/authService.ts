import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User";
import connectRedis from "../utils/redis";

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

    let existingUser;

    try {
      existingUser = await User.findOne({ email });
    } catch (err) {
      throw new Error("입력한 이메일을 찾을 수 없습니다.");
    }

    if (existingUser) {
      throw new Error("이미 가입된 이메일입니다.");
    }

    let hashedPassword;

    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      throw new Error("비밀번호 암호화 중 에러가 발생했습니다.");
    }

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

    let existingUser;

    try {
      existingUser = await User.findOne({ email });
    } catch (err) {
      throw new Error("입력한 이메일을 찾을 수 없습니다.");
    }

    if (!existingUser) {
      throw new Error("존재하지 않는 유저입니다.");
    }

    let isValidPassword = false;

    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      throw new Error("비밀번호 비교가 실패했습니다.");
    }

    if (!isValidPassword) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }

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

    return {
      userId: existingUser.id,
      nickname: existingUser.nickname,
      accessToken,
      refreshToken,
    };
  };
}

export default AuthService;
