import bcrypt from "bcrypt";

import CustomError from "../errors/customError";

class BcryptModule {
  static checkPassword = async (
    inputtedPassword: string,
    targetPassword: string
  ) => {
    const isValidPassword = await bcrypt.compare(
      inputtedPassword,
      targetPassword
    );

    if (!isValidPassword) {
      throw new CustomError(400, "비밀번호가 일치하지 않습니다.");
    }
  };

  static hashPassword = async (password: string) => {
    const hashedPassword = await bcrypt.hash(password, 12);

    return hashedPassword;
  };
}

export default BcryptModule;
