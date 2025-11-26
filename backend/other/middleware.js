import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js'; 
const secret_key = process.env.secret_key;

const middleware = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ status: 401, message: 'Please login' });
    }
    const decode = jwt.verify(token, secret_key);
    req.user = decode;
    return next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      console.log(`JWT Error: ${err.name}, sending JSON to trigger frontend redirect`);
      return res.status(401).json({ redirect: '/login', message: 'Token invalid' });
    }

    console.log("something else went wrong", err);
    return res.status(500).json({ message: "Something went wrong in middleware" });
  }
}

export default middleware;