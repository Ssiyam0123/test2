import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, role,res) => {
  const token = jwt.sign({ userId, role }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "none",        
    secure: true,    
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
