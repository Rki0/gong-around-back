import { Request, Response } from "express";

import AuthService from "../services/authService";

class AuthController {
  public authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signUp = async (req: Request, res: Response) => {
    const inputtedUserInfo = req.body;

    await this.authService.signUp(inputtedUserInfo);

    return res
      .status(201)
      .json({ message: "성공적으로 회원가입이 완료되었습니다." });
  };

  logIn = async (req: Request, res: Response) => {
    const inputtedUserInfo = req.body;

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
  };

  logOut = async (req: Request, res: Response) => {
    const userId = req.userId as string;

    await this.authService.logOut(userId);

    res.cookie("refresh_token", null);

    return res.status(204).json();
  };

  reSignAccessToken = async (req: Request, res: Response) => {
    if (!req.headers.authorization) {
      return;
    }

    const expiredAccessToken = req.headers.authorization.split("Bearer ")[1];
    const refreshToken = req.cookies.refresh_token;

    try {
      const { newAccessToken, newRefreshToken } =
        await this.authService.reSignAccessToken(
          expiredAccessToken,
          refreshToken
        );

      res.cookie("refresh_token", newRefreshToken, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 14,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({ access_token: newAccessToken });
    } catch (err) {
      // access token expired && refresh token expired
      if (err.message === "jwt expired") {
        // TODO: 백엔드 쪽에서는 로그아웃이 되겠지만, 프론트 쪽에서는 로그아웃이 된게 아니기 때문에 이를 알려줄 방법이 필요함.
        // TODO: 로그아웃 API에서 판단 기준을 보내줘야할듯.
        res.cookie("refresh_token", null);

        return res.status(400).json({ message: err.message });
      }

      return res.status(500).json({ message: err.message });
    }
  };
}

export default AuthController;
