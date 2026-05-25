const mongoose = require('mongoose');

const userSchema = new mongoose .Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        require: true
    },
    otp: {
        type: String,
        trim: true,
        // default: () => {
        //     return Math.round(Math.random() * 1e6)
        //     .toString()
        //     .padStart(6, '0');
        // },
    },
    otpExpire: {
        type: Number,
        default: () => { 
            return Date.now() + (10 * 60 * 1000)
        }
    },
    profilePicture: {
        secureUrl: {
            type: String,
            require: true,
            trim: true
        },
        publicId: {
            type: String,
            require: true,
            trim: true
        }
    },
    isVerified: {
        type: Boolean,
        require: true
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockedAt: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    bankName: {
        type: String,
        require: true,
        trim : true
    },
    accountNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true
    },
    userName: {
        type: String,
        default: function (){
            return `${
                this.fullName.slice(0, 7).trim()
            }`
        }
    }

})

const userModel = mongoose.model('userInfo', userSchema)

module.exports = userModel;
