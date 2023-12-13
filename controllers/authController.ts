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

  logIn = async (req: Request, res: Response) => {
    const inputtedUserInfo = req.body;

    try {
      const { accessToken, refreshToken, userId, nickname } =
        await this.authService.logIn(inputtedUserInfo);

      res.cookie("refresh_token", refreshToken, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 14,
        secure: true,
        sameSite: "none",
      });

      return res
        .status(201)
        .json({ access_token: accessToken, userId, nickname });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };

  logOut = async (req: Request, res: Response) => {
    const userId = req.body.userId;

    try {
      await this.authService.logOut(userId);

      res.cookie("refresh_token", null);

      return res.status(204).json();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}

export default AuthController;
