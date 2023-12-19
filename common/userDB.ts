import User from "../models/User";

class UserDB {
  static getById = async (userId: string) => {
    let existingUser;

    try {
      existingUser = await User.findById(userId);
    } catch (err) {
      throw new Error("유저 정보를 찾을 수 없습니다.");
    }

    if (!existingUser) {
      throw new Error("존재하지 않는 유저입니다.");
    }

    return existingUser;
  };
}

export default UserDB;
