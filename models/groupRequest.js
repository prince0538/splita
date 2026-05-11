const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    groupId : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'groupInfo'
    },
    userId : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'userInfo'
    },
    groupName: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    userInfo: {
        type: String,
        required: true
    }

}, { timestamps: true  });

const requestModel = mongoose.model('request', requestSchema);

module.exports = requestModel;