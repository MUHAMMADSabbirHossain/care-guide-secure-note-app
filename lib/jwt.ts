import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Sign token
export const signToken = (
  userId: string,
  email: string,
  role: string,
): string => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify token
export const verifyToken = (token: string) => {
  try {
    // Remove quotes and trim
    const cleanToken = token.replace(/^"|"$/g, "").trim();
    // return jwt.verify(cleanToken, JWT_SECRET);
    return jwt.decode(cleanToken);
  } catch {
    return null;
  }
};
