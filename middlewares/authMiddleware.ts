import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// import connectRedis from "../utils/redis";

interface JwtCustomPayload extends JwtPayload {
  userId: string;
  nickname: string;
}

const authMiddleware = async (
  // req: CustomRequest,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    throw new Error("There is no headers setting for authorization!");
  }

  const accessToken = req.headers.authorization.split("Bearer ")[1];

  if (!accessToken) {
    throw new Error("No token!");
  }

  // TODO: 토큰 만료시 여기서 jwt expired 에러가 throw 되는 것으로 보인다.
  // TODO: 따라서, 이 곳을 기점으로 코드를 분기 처리해야할 것으로 보인다.
  jwt.verify(accessToken, process.env.JWT_KEY as string);

  const { userId } = jwt.decode(accessToken) as JwtCustomPayload;

  if (!userId) {
    throw new Error("No user data");
  }

  // reference
  // https://www.kindacode.com/article/express-typescript-extending-request-and-response-objects/
  req.userId = userId;

  // SUGGEST: 다시 생각하자...너무 꼬여버렸다 ㅠㅠ 일단은 access token만 가지고 API 구현부터 하자.
  // jwt.verify(
  //   accessToken,
  //   process.env.JWT_KEY as string,
  //   async (err, decoded) => {
  //     // valid access token
  //     if (!err) {
  //       next();
  //     }

  //     if (!decoded) {
  //       return res.status(500).json({ message: "토큰 정보 없음" });
  //     }

  //     const { userId, nickname } = decoded as JwtCustomPayload;

  //     const redisClient = await connectRedis();

  //     let refreshToken;

  //     try {
  //       refreshToken = await redisClient.get(userId);
  //     } catch (err) {
  //       redisClient.disconnect();
  //       throw new Error("리프레쉬 토큰 탐색 실패");
  //     }

  //     // invalid access token, no refresh token
  //     if (!refreshToken) {
  //       return res
  //         .status(500)
  //         .json({ message: "리프레쉬 토큰이 존재하지 않습니다." });
  //     }

  //     console.log("RT from redis", refreshToken);

  //     jwt.verify(
  //       refreshToken,
  //       process.env.JWT_KEY as string,
  //       (err, decoded) => {
  //         // invalid access token, invalid refresh token
  //         if (err) {
  //           return res
  //             .status(500)
  //             .json({ message: "세션이 만료되었습니다. 다시 로그인해주세요." });
  //         }

  //         if (!decoded) {
  //           return;
  //         }

  //         // invalid access token, valid refresh token
  //         jwt.sign(
  //           {
  //             userId,
  //             nickname,
  //           },
  //           process.env.JWT_KEY as string,
  //           { expiresIn: "30m" }
  //         );

  //         // req.userData = {
  //         //   userId: decodedToken.userId,
  //         //   manager: decodedToken.manager,
  //         // };
  //       }
  //     );

  //     redisClient.disconnect();
  //   }
  // );

  next();
};

export default authMiddleware;
