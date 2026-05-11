const mongoose = require('mongoose');

const groupSchema = new mongoose .Schema({
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userInfo',
        required: true
    },
    members: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'userInfo'
    }],
    contributionAmount: {
        type: String,
        required: true,
        trim: true
    },
    contributionFrequecy: {
        type: String,
        require: true,
        enum: ['daily', 'weekly', 'monthly'],
        trim: true
    },
    payoutFrequecy: {
        type: String,
        require: true,
        enum: ['daily', 'weekly', 'monthly'],
        trim: true
    },
    describeGroup: {
        type: String,
        trim: true,
    },
    TotalMembers: {
        type: Number,
        require: true,
        trim: true
    },
    


},{ timestamps: true });

const groupModel = mongoose.model('groupInfo', groupSchema)

module.exports = groupModel;