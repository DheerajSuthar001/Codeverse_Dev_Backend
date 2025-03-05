const express=require('express');
const { updateProfile, deleteAccount, getAllUserDetails, getEnrolledCourses, updateDisplayPicture,instructorDashboard } = require('../controllers/ProfileC');
const {auth,isInstructor}=require('../middlewares/authMiddleware');
const router=express.Router();

router.put('/updateprofile',auth,updateProfile);
router.delete('/deleteaccount',auth,deleteAccount);
router.get('/getalluserdetails',auth,getAllUserDetails);
router.get('/getallenrolledcourses',auth,getEnrolledCourses);
router.put('/updatedisplaypicture',auth,updateDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)
module.exports=router;


