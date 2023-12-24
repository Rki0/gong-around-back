import { Request, Response, NextFunction } from "express";
import JwtModule from "../common/jwtModule";

const authMiddleware = async (
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

  try {
    // verify access token
    JwtModule.verifyToken(accessToken);
  } catch (err) {
    // the error which is not expired error
    if (err.message !== "jwt expired") {
      throw new Error(err.message);
    }

    // access token expired
    // redirect to the other API to check refresh token and resign access token
    return res.redirect("/api/auth/resignToken");
  }

  const { userId } = JwtModule.decodeToken(accessToken);

  // reference
  // https://www.kindacode.com/article/express-typescript-extending-request-and-response-objects/
  req.userId = userId;

  next();
};

export default authMiddleware;
