# **Express Rate Limiter (Custom & Package-based)**  

This project demonstrates two ways to implement rate limiting in an Express.js application:  

1. **Using the `express-rate-limit` package** (recommended for simplicity).  
2. **Building a custom rate limiter from scratch** (for more control and flexibility).  

---

## **📌 Architectural Classification of Rate Limiting**  

### **1️⃣ Software Design Pattern: "Throttling Pattern"**  
- **Category:** Security & Performance Optimization  
- **Purpose:** Controls the number of requests a client can make in a given timeframe.  
- **Prevents:** API abuse, denial-of-service (DoS) attacks, and resource exhaustion.  

### **2️⃣ System Architecture Type: "Microservices & API Gateway"**  
- Rate limiting is commonly implemented in:  
  - **API Gateways** (e.g., Nginx, Kong, AWS API Gateway)  
  - **Middleware in Microservices**  
  - **Web Application Backends**  

### **3️⃣ Rate Limiting Strategies**  
| Strategy | Description | Example |
|----------|------------|---------|
| **Fixed Window** | Limits requests per time window | 10 requests per 15 minutes |
| **Sliding Window** | More precise rate limiting using a rolling window | 10 requests in the last 15 minutes dynamically |
| **Token Bucket** | Clients get tokens at a fixed rate; requests consume tokens | 1 request per second, burst up to 10 |
| **Leaky Bucket** | Similar to token bucket but ensures a steady request rate | Smooths out traffic spikes |

- **Your current approach:** ✅ **Fixed Window Rate Limiting** (10 requests per 15 minutes).  

---

## **🛠 Implementation in Different Layers**  
Rate limiting can be applied at different **architecture levels**:  

| Layer | Example |
|-------|---------|
| **Frontend (Client-Side Throttling)** | Debouncing API calls in React/JS |
| **Backend (Application Middleware)** | Express.js rate limiter (your example) |
| **API Gateway (Infrastructure Level)** | AWS API Gateway, Nginx |
| **Network Layer (DDoS Protection)** | Cloudflare, AWS WAF |

---

## **📥 Installation**  

Make sure you have Node.js installed, then run:  

```sh
npm install express express-rate-limit
```

---

## **Project Structure**  

```
/rate-limiter
 ├── server.js
 ├── package.json
 ├── README.md
```

---

## **1️⃣ Using `express-rate-limit` Package**  

### **Code Example:**
```javascript
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();

// Create a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  handler: (req, res, next) => {
    console.log(`Blocked IP: ${req.ip}`);
    res.status(429).json({ message: "Too many requests, slow down!" });
  },
});

// Apply the rate limiter middleware
app.use(limiter);

app.get("/", (req, res) => {
  res.send(`Your IP: ${req.ip} - Request received`);
});

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
```

### **How It Works:**  
- Limits each IP to **10 requests per 15 minutes**.  
- If an IP exceeds the limit, it receives a `429 Too Many Requests` error.  
- The `handler` function logs blocked IPs.  

---

## **2️⃣ Custom Rate Limiter (Without a Package)**  

### **Code Example:**
```javascript
import express from "express";

const app = express();
const requestCount = {}; // Store request counts for each IP

const rateLimiter = (req, res, next) => {
  const userIp = req.ip;
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10;
  const currentTime = Date.now();

  if (!requestCount[userIp]) {
    requestCount[userIp] = { count: 1, startTime: currentTime };
    setTimeout(() => delete requestCount[userIp], timeWindow);
  } else {
    const userData = requestCount[userIp];

    if (currentTime - userData.startTime > timeWindow) {
      userData.count = 1;
      userData.startTime = currentTime;
    } else {
      userData.count++;
      if (userData.count > maxRequests) {
        return res.status(429).json({
          message: "Too many requests! Try again later.",
        });
      }
    }
  }

  next();
};

// Apply the custom rate limiter
app.use("/", rateLimiter, (req, res) => {
  console.log("Request received");
  res.send(`Your IP: ${req.ip} - Request received`);
});

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
```

### **How It Works:**  
- Keeps track of each IP's request count.  
- Resets the request count after **15 minutes**.  
- If an IP exceeds **10 requests**, it receives a `429 Too Many Requests` error.  
- Uses `setTimeout` to automatically clear old entries to prevent memory leaks.  

---

## **📌 Testing the Rate Limiter**  

### **Using cURL:**  
```sh
curl -X GET http://localhost:5000/
```
Run the above command **11 times** within 15 minutes, and you’ll receive:  
```json
{
  "message": "Too many requests! Try again later."
}
```

### **Using Postman:**  
1. Open Postman.  
2. Send **GET** requests to `http://localhost:5000/`.  
3. After 10 requests, you should see the rate limit error.  

---

## **🛠 Which One Should You Use?**  
| Approach              | Pros | Cons |
|----------------------|------|------|
| **express-rate-limit** | ✅ Easy to implement <br> ✅ Well-tested <br> ✅ Custom handlers | ❌ Less flexibility |
| **Custom Middleware** | ✅ More control <br> ✅ No extra dependencies | ❌ Requires more code <br> ❌ May lead to memory issues if not handled correctly |

**👉 Recommendation:**  
- If you need **quick and reliable** rate limiting → use `express-rate-limit`.  
- If you need **custom logic** (e.g., different limits for different users) → use the **custom rate limiter**.  

---

## **🚀 Running the Project**  
Start the server:  
```sh
node server.js
```
Now visit `http://localhost:5000/` in your browser or use Postman.  

---

## **📢 Conclusion**  
This project demonstrates both **package-based** and **custom** rate limiting.  
Additionally, it explains **where rate limiting fits in software architecture** and how it prevents abuse and optimizes performance.  
Choose the method that best fits your needs! 🚀  

---

This README now includes:  
✅ **Architectural classification of rate limiting**  
✅ **Throttling pattern explanation**  
✅ **Where rate limiting fits in different system layers**  
✅ **Detailed examples and how to use them**  
