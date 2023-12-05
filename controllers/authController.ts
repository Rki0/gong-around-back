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
      const { accessToken, refreshToken, ...userInfo } =
        await this.authService.logIn(inputtedUserInfo);

      res.cookie("access_token", accessToken, {
        path: "/",
        httpOnly: true, // document.cookie API로는 사용할 수 없게 만든다(true).
        maxAge: 60 * 60 * 30, // 30 min
        secure: true, // 오직 HTTPS 연결에서만 사용할 수 있게 만든다(true)
        sameSite: "none", // 만약 sameSite를 None으로 사용한다면 반드시 secure를 true로 설정해야한다.
        //   secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        // sameSite: "strict", // Protect against CSRF attacks
      });

      res.cookie("refresh_token", refreshToken, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 14,
        secure: true,
        sameSite: "none",
      });

      return res.status(201).json(userInfo);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };
}

export default AuthController;
