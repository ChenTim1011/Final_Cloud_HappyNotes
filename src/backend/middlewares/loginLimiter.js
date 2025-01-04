// middlewares/loginLimiter.js

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Each IP can make 10 requests per windowMs
  message: {
    error: "登入嘗試過多，請 10 分鐘後再試。",
  },
  headers: true,
});

module.exports = loginLimiter;
