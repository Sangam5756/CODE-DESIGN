import express from "express";
import rateLimit from "express-rate-limit";
const app = express();

// // using the package
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, //15 minutes
//   max: 10, //number of request allow in 15 minutes
//   message: {
//     status: 429,
//     message: "Too many request please try again later.",
//   },
//   handler: (req, res, next) => {
//     console.log(`Blocked IP: ${req.ip}`);
//     res.status(429).json({ message: "Too many requests, slow down!" });
//   },
// });

// app.use(limiter);

// without package
const requestCount = {};

const rateLimiter = (req, res, next) => {
  const userIp = req.ip;
  const timeWindow = 15 * 60 * 1000;
  const maxRequest = 10;
  const currentTime = Date.now();
  // check the user is present
  if (!requestCount[userIp]) {
    requestCount[userIp] = {
      count: 1,
      startTime: currentTime,
    };

    setTimeout(() => delete requestCount[userIp], timeWindow);
  } else {
    const userData = requestCount[userIp];
    if (currentTime - userData.startTime > timeWindow) {
      userData.count = 1;
      userData.startTime = currentTime;
    } else {
      userData.count++;
      if (userData.count > maxRequest) {
        return res.status(429).json({
          message: "Too many request!. Try again some time later",
        });
      }
    }
    next();
  }
};

app.use("/", rateLimiter, (req, res) => {
  console.log("called");
  res.send(`Your IP: ${req.ip} - Request received`);
});

app.listen(5000, () => {
  console.log("server is listeining on port 5000");
});
