const express=require('express');
const {auth,isAdmin,isInstructor,isStudent}=require('../middlewares/authMiddleware');
const {createCourse, getAllCourses, getCourseDetails,editCourse,getFullCourseDetails,getInstructorCourses,deleteCourse}=require('../controllers/CourseC');
const {createSection, updateSection, deleteSection}=require('../controllers/SectionC');
const { createSubSection, updateSubSection, deleteSubSection } = require('../controllers/SubSectionC');
const { createCategory, showAllCategory, categoryPageDetails } = require('../controllers/CategoryC');
const { addRatingAndReview, getAllRatings, getAverageRating,getAllRating } = require('../controllers/RatingAndReviewC');
const {updateCourseProgress}=require('../controllers/courseProgress')

const router=express.Router();

//Courses can only be created by instructor

router.post('/createcourse',auth,isInstructor,createCourse);
router.post('/addsection',auth,isInstructor,createSection);
router.post('/updatesection',auth,isInstructor,updateSection);
router.post('/deletesection',auth,isInstructor,deleteSection);
router.post('/addsubsection',auth,isInstructor,createSubSection);
router.post('/updatesubsection',auth,isInstructor,updateSubSection);
router.post('/deletesubsection',auth,isInstructor,deleteSubSection);
router.post("/editCourse", auth, isInstructor, editCourse)
router.post('/getcoursedetails',getCourseDetails)
router.get("/getAllCourses", getAllCourses)
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
router.delete("/deleteCourse", deleteCourse);
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);
//category can only be created by admin

router.post('/createcategory',auth,isAdmin,createCategory);
router.get('/showallcategories',showAllCategory);
router.post('/getcategorypagedetails',categoryPageDetails);

//Rating and reviews
router.post('/createrating',auth,isStudent,addRatingAndReview);
router.get('/getallratings',getAllRatings);
router.get('/getaveragerating',getAverageRating);
router.get("/getReviews", getAllRatings)
module.exports=router;


