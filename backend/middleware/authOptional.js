const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function authOptional(req, res, next) {
  const header = req.headers.authorization;

  // No token → continue as guest
  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    req.user = user || null;
    next();
  } catch (err) {
    // Invalid token → treat as guest
    req.user = null;
    next();
  }
};
