import User from "../models/User";
import CustomError from "../errors/customError";

class UserDB {
  static getById = async (userId: string, option?: string) => {
    // reference : findById with selected field
    // https://mongoosejs.com/docs/api/model.html#Model.findById()
    const existingUser = await User.findById(userId, option);

    if (!existingUser) {
      throw new CustomError(400, "존재하지 않는 유저입니다.");
    }

    return existingUser;
  };

  static getByEmail = async (email: string) => {
    const existingUser = await User.findOne({ email });

    return existingUser;
  };
}

export default UserDB;
