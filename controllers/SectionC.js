const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require('../models/SubSection');

exports.createSection = async (req, res) => {
    try {
        const { sectionName, courseId } = req.body;

        if (!sectionName || !courseId)
            return res.status(403).json({
                success: false,
                message: "Missing properties"
            })
        
        const newSectionData=await Section.create({
            sectionName
        });
            
        //Adding section id in course
        const updatedCourseDetails =await Course.findByIdAndUpdate(courseId,{$push:{courseContent:newSectionData._id}},{new:true}).populate({
            path:'courseContent',
            populate:{
                path:'subSections'
            }
        }).exec()

        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails
        });
    } catch (error) {
        console.log("Error in creating section",error);
        res.status(500).json({
            success:false,
            message:"Something went wrong while creating Section"
        })
    }
};
exports.updateSection=async (req,res)=>{
    try {
		const { sectionName, sectionId,courseId } = req.body;
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

		const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSections",
			},
		})
		.exec();

		res.status(200).json({
			success: true,
			message: section,
			data:course,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}
exports.deleteSection=async (req,res)=>{
    try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSections}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSections"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}