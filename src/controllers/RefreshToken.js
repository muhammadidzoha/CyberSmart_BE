import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ** Refresh Token Admin

export const refreshTokenAdmin = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const user = await prisma.userAdmin.findMany({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decode) => {
        if (err) return res.sendStatus(403);
        const userId = user[0].id;
        const name = user[0].name;
        const username = user[0].username;
        const accessToken = jwt.sign(
          { userId, name, username },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1h",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ** Refresh Token User

export const refreshTokenKlien = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const user = await prisma.userKlien.findMany({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user[0]) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decode) => {
        if (err) return res.sendStatus(403);
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = jwt.sign(
          { userId, name, email },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1d",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
