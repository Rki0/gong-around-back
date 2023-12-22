import bcrypt from "bcrypt";

class BcryptModule {
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

export default BcryptModule;
