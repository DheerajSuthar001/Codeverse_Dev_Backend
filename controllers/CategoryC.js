const Category = require('../models/Category');
const Course = require('../models/Course');

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        //validations
        if (!name || !description) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        // db call
        const categoryData = await Category.create({ name, description });
        
        return res.status(200).json({
            success: true,
            message: "Category created successfully",

        });


    } catch (error) {
        console.log("Something went wrong while creating category", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating category"
        })
    }
}
exports.showAllCategory = async (req, res) => {
    try {
        const allCategories = await Category.find({});

        return res.status(200).json({
            success: true,
            data:allCategories,
            message: "All categories are returned"
        })
    } catch (error) {
        console.log("Something went wrong while fetching all categories", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching categories"
        })
    }
}
exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      
      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: "ratingAndReview",
          populate:"instructor"
        })
        .exec()
  
      //console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec()
        //console.log("Different COURSE", differentCategory)
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
       // console.log("mostSellingCourses COURSE", mostSellingCourses)
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }