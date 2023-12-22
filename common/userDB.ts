import bcrypt from "bcrypt";

import User from "../models/User";

class UserDB {
  static getById = async (userId: string, option?: string) => {
    let existingUser;

    try {
      // reference : findById with selected field
      // https://mongoosejs.com/docs/api/model.html#Model.findById()
      existingUser = await User.findById(userId, option);
    } catch (err) {
      throw new Error("유저 정보를 찾을 수 없습니다.");
    }

    if (!existingUser) {
      throw new Error("존재하지 않는 유저입니다.");
    }

    return existingUser;
  };

  static checkPassword = async (
    inputtedPassword: string,
    targetPassword: string
  ) => {
    let isValidPassword = false;

    try {
      isValidPassword = await bcrypt.compare(inputtedPassword, targetPassword);
    } catch (err) {
      throw new Error("비밀번호 비교가 실패했습니다.");
    }

    if (!isValidPassword) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }
  };
}

export default UserDB;
