import { Request, Response } from "express";

import AuthService from "../services/authService";

class AuthController {
  public authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signUp = async (req: Request, res: Response) => {
    const inputtedUserInfo = req.body;

    try {
      await this.authService.signUp(inputtedUserInfo);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }

    return res
      .status(201)
      .json({ message: "성공적으로 회원가입이 완료되었습니다." });
  };
}

export default AuthController;
