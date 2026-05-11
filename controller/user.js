const userModel = require('../models/user');
const cloudinary = require('../middlewares/cloudinary');
const fs = require('fs');
const bcrypt = require('bcrypt')
const {brevo} = require('../utils/brevo');
const {emailTemplate, resetPasswordTemplate, resetPasswordSuccessfulTemplate } = require('../email')
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

exports.createUser = async(req, res) => {
    try {
        
        const { fullName, email, phoneNumber, password, role } = req.body

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })
        console.log(otp)
        const User = await userModel.findOne({email: email.toLowerCase()});
        if(User){
            return res.status(400).json({
            message: 'User with email already exist'
        })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({
            fullName,
            email,
            phoneNumber,
            password: hashPassword,
            otp,
            role
        })
        brevo(newUser.email, newUser.fullName, emailTemplate(newUser.fullName, newUser.otp))
        await newUser.save()
        res.status(201).json({
            message: 'User created successfully',
            data: newUser
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Somthing went wrong'
        })
    }
}

exports.updateUser = async(req, res) => {
    try {

        const files = req.file;
        const filePath = files['path']

        const uploadToCloudinary = await cloudinary.uploader.upload(filePath);
        const extractSecureurl = {secureUrl:uploadToCloudinary.secure_url, publicId: uploadToCloudinary.public_id}
        fs.unlinkSync(filePath)
        
        const { bankName, accountNumber} = req.body
        const { id } = req.params

        const user = await userModel.findById(id);

        const updateUser = await userModel.findByIdAndUpdate(id,
            {
                bankName,
                accountNumber,
                profilePicture: extractSecureurl
            },
            {
                new: true
            }
        )
        res.status(200).json({
            message: 'User updated successfully',
            data: updateUser
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.verifyEmail = async(req, res) => {
    try {
        
        const { email, otp } = req.body;
        const user = await userModel.findOne({email: email})
        console.log(user)
        if(!user){
            return res.status(400).json({
                message: 'User not found'
            })
        }
        if(user.otp !== otp){
            return res.status(400).json({
                message: 'Invalid OTP'
            })
        }
        user.isVerified = true;
        await user.save();
        res.status(200).json({
            message: 'Email verified successfully',
            data: user
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.login = async(req, res) => {
    try {
        
        const { email, password } = req.body;
        const user = await userModel.findOne({email: email})

        if(!user || user.email !== email || !user.password) {
            return res.status(404).json({
                message: 'Invalid credentials'
            })
        };

        const correctPassword = await bcrypt.compare(password, user.password);

        if(!correctPassword) {
            return res.status(404).json({
                message: 'Invalid Credentials'
            })
        };

        if(user.isVerified === false) {
            return res.status(400).json({
                message: 'Please verify your email'
            })
        };

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.status(200).json({ 
            message: 'Login successful',
            data: user,
            token
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.forgetPassword = async(req, res) => {
    try {
        // extract the user email from the request body
        const { email } = req.body
        // find user
        const user = await userModel.findOne({email: email.toLowerCase() });
        // check if user exits
        if(user === null){
            return res.status(404).json({
                message: 'Invalid credentials'
            })
        }
        // generate otp
        const otp = Math.round(Math.random() * 1e4)
        .toString()
        .padStart(4, '0');

        user.otp = otp
        user.otpExpires = Date.now() + ((1000 * 60 * 30));
        console.log(otp)
        const data = {
            name: user.fullName,
            otp: otp
        }
        brevo(user.email, user.fullName, resetPasswordTemplate(data))
        await user.save()
        res.status(200).json({
            message: 'OTP sent successfully'
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}


exports.resetPassword = async(req, res) => {
    try {
        const { otp, password, email } = req.body;
        const user = await userModel.findOne({ email: email.toLowerCase() });

        if(user == null) {
            return res.status(404).json({
                message: 'Invaild credentials'
            })
        }
        console.log(Date.now() > user.otpExpires)
        
        console.log(user.otp)

        if(Date.now() > user.otpExpires || otp !== user.otp) {
            return res.status(400).json({
                message: 'Invalid OTP'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        user.password = hashPassword
        await user.save();
        brevo(user.email, user.fullName, resetPasswordSuccessfulTemplate(user.fullName))
        res.status(200).json({
            message: 'Password reset successful'
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.changePassword = async(req, res) => {
    try {
        const { id } = req.user;

        const { oldPassword, newPassword } = req.body;

        const user = await userModel.findById(id);

        if(!user) {
            return res.status(400).json({
                message: 'User not found'
            })
        }

        const checkPassword = await bcrypt.compare(oldPassword, user.password);
        if(!checkPassword) {
            return res.status(400).json({
                message: 'Old password isinvalid'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        user.password = hashedPassword;
        await user.save()

        res.status(200).json({
            message: 'Password changed successfully'
        })


    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.loginWithGoogle = async (req, res) => {
    try {
        console.log('User', req.user)
        const token = await jwt.sign({id: req.user._id, role: req.user.role}, process.env.JWT_SECRET, { expiresIn: '1d'});

        res.status(200).json({
            message: 'Login successfully',
            data: req.user.fullName,
            token
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const user = await userModel.find()

        res.status(200).json({
            message: 'All users retrieved successfully',
            data: user
        })
    } catch (error) {
        console.log(error.message)
         res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        
        const { id } = req.params
        const users = await userModel.findByIdAndDelete(id);
        if (!users) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.status(200).json({
            message: 'User deleted successfully',
            data: users
        })
    } catch (error) {
        console.log(error.message)
         res.status(500).json({
            message: 'Something went wrong'
        })
    }
}