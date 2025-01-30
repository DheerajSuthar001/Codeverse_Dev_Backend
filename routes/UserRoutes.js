const express = require('express');
const { login, signUp, changePassword, sendOtp } = require('../controllers/AuthC');
const { auth } = require('../middlewares/authMiddleware');
const { resetPasswordToken, resetPassword } = require('../controllers/ResetPasswordC');

const router = express.Router();

//Routes for user Login, signup, and authentication
router.post('/login', login);
router.post('/signup', signUp);
router.post('/sendotp', sendOtp);
router.post('/changePassword', auth, changePassword);

//Routes to reset password
router.post('/reset-password-token', resetPasswordToken);
router.post('/reset-password', resetPassword);

module.exports = router;