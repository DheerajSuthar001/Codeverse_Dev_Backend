const express=require('express');
const { updateProfile, deleteAccount, getAllUserDetails, getEnrolledCourses, updateDisplayPicture } = require('../controllers/ProfileC');
const {auth}=require('../middlewares/authMiddleware');
const router=express.Router();

router.put('/updateprofile',auth,updateProfile);
router.post('/deleteaccount',auth,deleteAccount);
router.get('/getalluserdetails',auth,getAllUserDetails);
router.get('/getallenrolledcourses',auth,getEnrolledCourses);
router.put('/updatedisplaypicture',auth,updateDisplayPicture);
module.exports=router;


