import { Request, Response } from "express";

import UserService from "../services/userService";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  withdraw = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const password = req.body.password;

    await this.userService.withdraw(userId, password);

    res.cookie("refresh_token", null);

    return res.status(201).json({ message: "회원 탈퇴 성공" });
  };

  likedFeeds = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const page = parseInt(req.query.page as string, 10);

    const likedFeeds = await this.userService.likedFeeds(userId, page);

    return res.status(201).json(likedFeeds);
  };

  updateInfo = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const inputtedInfo = req.body;

    await this.userService.updateInfo(userId, inputtedInfo);

    return res.status(201).json({ message: "회원 정보 수정 성공" });
  };
}

export default UserController;
