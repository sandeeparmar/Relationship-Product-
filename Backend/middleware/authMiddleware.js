import jwt from "jsonwebtoken";

export const middle = ((req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("Auth Middleware: No token found in cookies.");
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }
  catch (err) {
    console.log("Auth Middleware: Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid token" })
  }
});