import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { env } from "../config/env.js";

/* ================= REGISTER ================= */

export const register = async (req, res) => {
try {

```
const { email, username, password } = req.body;

if (!email || !username || !password) {
  return res.status(400).json({ error: "Email, username and password are required" });
}

if (password.length < 6) {
  return res.status(400).json({ error: "Password must be at least 6 characters" });
}

const normalizedEmail = email.toLowerCase().trim();

const emailExists = await User.findOne({ email: normalizedEmail });

if (emailExists) {
  return res.status(409).json({ error: "Email already registered" });
}

const usernameExists = await User.findOne({ username });

if (usernameExists) {
  return res.status(409).json({ error: "Username already taken" });
}

const hashedPassword = await bcrypt.hash(password, 10);

const user = await User.create({
  email: normalizedEmail,
  username,
  password: hashedPassword,
  role: "student",
});

const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
  },
  env.JWT_SECRET,
  { expiresIn: "7d" }
);

/* ===== Activity Log ===== */

await Activity.create({
  user: user._id,
  action: "register",
  resource: "auth",
  details: "User account created",
});

res.status(201).json({
  token,
  user: {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  },
});
```

} catch (err) {
res.status(500).json({ error: "Server error" });
}
};

/* ================= LOGIN ================= */

export const login = async (req, res) => {
try {

```
const { email, password } = req.body;

if (!email || !password) {
  return res.status(400).json({ error: "Email and password required" });
}

const normalizedEmail = email.toLowerCase().trim();

const user = await User.findOne({ email: normalizedEmail }).select("+password");

if (!user) {
  return res.status(401).json({ error: "Invalid credentials" });
}

const match = await bcrypt.compare(password, user.password);

if (!match) {
  return res.status(401).json({ error: "Invalid credentials" });
}

const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
  },
  env.JWT_SECRET,
  { expiresIn: "7d" }
);

/* ===== Activity Log ===== */

await Activity.create({
  user: user._id,
  action: "login",
  resource: "auth",
  details: "User logged in",
});

res.json({
  token,
  user: {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
  },
});
```

} catch (err) {
res.status(500).json({ error: "Server error" });
}
};
