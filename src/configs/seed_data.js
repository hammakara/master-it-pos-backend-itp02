import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './db.js';
import User from '../models/User.js';
dotenv.config();
const run = async () => {
  try {
    await connectDB();
    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const role = process.env.ADMIN_ROLE;
    const newUser = new User({
      username,
      email,
      password,
      role,
    });
    await newUser.save();
    console.log('Admin user created successfully! ');
  } catch (err) {
    console.log(err);
  }
};
run();
