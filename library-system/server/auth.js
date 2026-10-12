import jwt from "jsonwebtoken";
import { User } from "./models.js";
import { fail } from "./validation.js";
export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
export function tokenFor(user) {
  return jwt.sign({ version: user.tokenVersion }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "8h",
    algorithm: "HS256",
    issuer: "librarysys",
    audience: "librarysys-clients",
  });
}
export async function authenticate(req, res, next) {
  try {
    const header = req.get("authorization") || "";
    if (!header.startsWith("Bearer ")) fail(401, "Please sign in to continue.");
    let payload;
    try {
      payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "librarysys",
        audience: "librarysys-clients",
      });
    } catch {
      fail(401, "Your session has expired. Please sign in again.");
    }
    const user = await User.findById(payload.sub);
    if (!user || user.tokenVersion !== payload.version)
      fail(401, "Please sign in again.");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
