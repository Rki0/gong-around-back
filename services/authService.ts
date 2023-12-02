import bcrypt from "bcrypt";

import User from "../models/User";

interface UserInfo {
  nickname: string;
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
      throw new Error("유저 등록 중 에러가 발생했습니다.");
    }
  };
}

export default AuthService;
