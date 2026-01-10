const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔐 No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // ⏰ Token expired
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired. Please login again.",
        });
      }

      // ❌ Invalid token
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const user = await User.findById(decoded.id);

    // 👤 User not found
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🚫 Blocked user
    if (user.blocked) {
      return res
        .status(403)
        .json({ message: "User is blocked by admin" });
    }

    /* ✅ Attach SAFE user object */
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (err) {
    // 🔥 This should rarely happen now
    console.error("AUTH MIDDLEWARE ERROR:", err);
    return res.status(500).json({ message: "Authentication failed" });
  }
};
