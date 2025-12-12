import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" }); // Token lasts 7 days
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
