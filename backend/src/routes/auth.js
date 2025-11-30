import express from "express";
import { Router } from "express";
import {register, login, me, updateProfile} from '../controllers/authController.js';
import authMiddleware from "../middleware/authMiddleware.js";

const router=Router();

router.post('/register',register);
router.post('/login',login);
router.get('/me',authMiddleware,me);
router.put('/profile', authMiddleware, updateProfile);

export default router;