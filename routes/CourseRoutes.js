const express=require('express');
const {auth,isAdmin,isInstructor,isStudent}=require('../middlewares/authMiddleware');
const {createCourse, getAllCourses, getCourseDetails}=require('../controllers/CourseC');
const {createSection, updateSection, deleteSection}=require('../controllers/SectionC');
const { createSubSection, updateSubSection, deleteSubSection } = require('../controllers/SubSectionC');
const { createCategory, showAllCategory, categoryPageDetails } = require('../controllers/CategoryC');
const { addRatingAndReview, getAllRatings, getAverageRating } = require('../controllers/RatingAndReviewC');

const router=express.Router();

//Courses can only be created by instructor

router.post('/createcourse',auth,isInstructor,createCourse);
router.post('/addsection',auth,isInstructor,createSection);
router.post('/updatesection',auth,isInstructor,updateSection);
router.post('/deletesection',auth,isInstructor,deleteSection);
router.post('/addsubsection',auth,isInstructor,createSubSection);
router.post('/updatesubsection',auth,isInstructor,updateSubSection);
router.post('/deletesubsection',auth,isInstructor,deleteSubSection);

router.get('/getallcourses',getAllCourses);
router.post('/getcoursedetails',getCourseDetails)

//category can only be created by admin

router.post('/createcategory',auth,isAdmin,createCategory);
router.get('/showallcategories',showAllCategory);
router.get('/getcategorypagedetails',categoryPageDetails);

//Rating and reviews
router.post('/createrating',auth,isStudent,addRatingAndReview);
router.get('/getallratings',getAllRatings);
router.get('/getaveragerating',getAverageRating);

module.exports=router;


