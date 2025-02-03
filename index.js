const express=require('express');
const app=express();
const UserRoutes=require('./routes/UserRoutes');
const CourseRoutes=require('./routes/CourseRoutes');
const ProfileRoutes=require('./routes/ProfileRoutes');
const PaymentRoutes=require('./routes/PaymentRoutes');

require('dotenv').config();

const {dbConnect}=require('./config/dbConnect');
const {cloudinaryConnect}=require('./config/cloudinaryConnect');

const cookieParser=require('cookie-parser');
const cors=require('cors');
const fileUpload=require('express-fileupload');

const PORT=process.env.PORT || 3000;
dbConnect();
cloudinaryConnect();


app.use(cookieParser());
app.use(express.json());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:'/temp'
}));
app.use(
    cors({
        origin:"http://localhost:4000"
    })
);
app.use('/api/v1/auth',UserRoutes);
app.use('/api/v1/profile',ProfileRoutes);
app.use('/api/v1/course',CourseRoutes);
app.use('/api/v1/payment',PaymentRoutes);

app.get('/',(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"Your server is up and Running"
    })
});
app.listen(PORT,()=>{
    console.log("App is running at",PORT);
})