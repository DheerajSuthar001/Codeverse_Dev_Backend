const Category = require('../models/Category');
const Course = require('../models/Course');
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
        console.log(categoryData);
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
        const allCategories = await Category.find({}, { name: true, description: true });

        return res.status(200).json({
            success: true,
            allCategories,
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
        const { categoryId } = req.body;

        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

        if (!selectedCategory)
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });

        const differentCategory = await Category.find({
            _id: { $ne: categoryId }
        }).populate("courses").exec();

        const topSellingCourse = await Course.aggregate([
            {
                $project: {
                    name: 1,
                    studentCount: { $size: "$studentEnrolled" }
                }
            },
            {
                $sort: { studentCount: -1 }
            },
            {
                $limit: 10
            }
        ]).exec();
        return res.status(200).json({
            success:true,
            selectedCategory,
            differentCategory,
            topSellingCourse
        })
    } catch (error) {
        console.log("Something went wrong while fetching types of courses", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching types of courses"
        })
    }
}