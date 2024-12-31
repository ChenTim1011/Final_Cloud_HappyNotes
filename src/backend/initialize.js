// initialize.js

const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

// Set the path to the .env.production file
const envPath = path.resolve(__dirname, ".env.production");

// Check if the .env.production file exists
if (!fs.existsSync(envPath)) {
  console.error(`環境變數文件未找到: ${envPath}`);
  process.exit(1);
}

// Check the content of the .env.production file
try {
  const envContent = fs.readFileSync(envPath, "utf8");
  console.log(".env.production 內容:\n", envContent);
} catch (err) {
  console.error("讀取 .env.production 時出錯:", err);
  process.exit(1);
}

// Use dotenv to load the environment variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("加載 .env.production 時出錯:", result.error);
  process.exit(1);
}

// Ensure the environment variables are loaded correctly
console.log("從以下路徑加載環境變數:", envPath);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_SSL_CA:", process.env.DB_SSL_CA);

// Now you can use the environment variables in your application
const mongoose = require("./config/db"); // 確保路徑正確
const User = require("./models/User"); // 確保路徑正確
const Whiteboard = require("./models/Whiteboard"); // 確保路徑正確
const Card = require("./models/Card"); // 確保路徑正確
const bcrypt = require("bcrypt"); // 引入 bcrypt 用於密碼雜湊

// SALT_ROUNDS 用於 bcrypt 雜湊密碼
const SALT_ROUNDS = 10;

// Set the default data for the admin user
const adminData = {
  userName: "admin",
  userPassword: "happynote", // 原始密碼
  email: "admin@example.com",
  isLoggedin: false,
  whiteboards: [],
  activityLog: [],
  tags: [],
};

// Set the default data for the whiteboard
const whiteboardData = {
  whiteboardTitle: "管理員的白板",
  isPrivate: true,
  userId: null,
  position: { x: 0, y: 0 },
  dimensions: { width: 800, height: 600 },
  cards: [],
};

// Set the default data for the card
const cardData = {
  cardTitle: "初始化卡片",
  content: "這是一個初始化卡片",
  dueDate: new Date("2024-12-31"),
  tag: "初始化",
  foldOrNot: false,
  comments: ["歡迎使用 HappyNote！"],
  position: { x: 100, y: 150 },
  dimensions: { width: 200, height: 150 },
  connection: [],
  connectionBy: [],
};

async function initializeDatabase() {
  try {
    // Wait for the database connection to be established
    await mongoose.connection;

    console.log("連接到資料庫成功");

    // Check if the database has already been initialized
    const existingUsers = await User.find();
    if (existingUsers.length > 0) {
      console.log("資料庫已經初始化過，不需要重複初始化。");
      return;
    }

    // Hash the admin user's password
    const hashedPassword = await bcrypt.hash(
      adminData.userPassword,
      SALT_ROUNDS
    );
    adminData.userPassword = hashedPassword;

    // Create the admin user
    const adminUser = new User(adminData);
    await adminUser.save();
    console.log("管理員使用者已創建");

    // Set the userId for the whiteboard
    whiteboardData.userId = adminUser._id.toString();

    // Create the whiteboard
    const whiteboard = new Whiteboard(whiteboardData);
    await whiteboard.save();
    console.log("白板已創建");

    // Create the card
    const card = new Card(cardData);
    await card.save();
    console.log("卡片已創建");

    // Update the whiteboard with the card's _id
    whiteboard.cards.push(card._id);
    await whiteboard.save();
    console.log("白板已更新，添加了卡片");

    // Create the card
    adminUser.whiteboards.push(whiteboard._id);
    await adminUser.save();
    console.log("管理員使用者已更新，添加了白板");

    console.log("資料庫初始化完成");
  } catch (error) {
    console.error("初始化資料庫時出錯：", error);
  } finally {
    mongoose.connection.close();
    console.log("資料庫連接已關閉");
  }
}

initializeDatabase();
