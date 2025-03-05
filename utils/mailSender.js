const nodeMailer=require('nodemailer');

exports.mailSender=async(email,title,body)=>{
    try {
        const transporter=nodeMailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            },
        })
        let info=await transporter.sendMail({
            from: "Codeverse",
            to:email,
            subject:title,
            html:`${body}`
        })
        
        return info;
    } catch (error) {
        console.log(error);
    }
}