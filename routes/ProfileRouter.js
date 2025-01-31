const express=require('express');
const { updateProfile, deleteAccount, getAllUserDetails, getEnrolledCourses, updateDisplayPicture } = require('../controllers/ProfileC');

const router=express.Router();

router.post('/updateprofile',auth,updateProfile);
router.post('/deleteaccount',deleteAccount);
router.get('/getalluserdetails',auth,getAllUserDetails);
router.get('/getallenrolledcourses',auth,getEnrolledCourses);
router.post('/updatedisplaypicture',auth,updateDisplayPicture);
module.exports=router;


