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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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