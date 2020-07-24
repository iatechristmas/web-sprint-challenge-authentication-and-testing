const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const secret = process.env.JWT_SECRET || "goonies never say die";
    jwt.verify(token, secret, (error, decodedToken) => {
      if (error) {
        res.status(401).json({ you: "You shall not pass" });
      } else {
        req.jwt = decodedToken;
        next();
      }
    });
  } else {
    res.status(400).json({ message: "You shall not pass" });
  }
};
