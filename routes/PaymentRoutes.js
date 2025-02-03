const express=require('express');
const {auth, isStudent } = require('../middlewares/authMiddleware');
const { capturePayment, verifySignature } = require('../controllers/Payments');

const router=express.Router();

router.post('/capturepayment',auth,isStudent,capturePayment);
router.post('/verifysignature',verifySignature);

module.exports=router;