const requestModel = require('../models/groupRequest');
const groupModel = require('../models/group');
const userModel = require('../models/user');

exports.createRequest = async (req, res) => {
    try {
        // Get the user id from the request
        const { id } = req.user;
        // Get the group id from the request params
        const {groupId} = req.params;
        // Check if group exits
        const group = await groupModel.findById(groupId);

        if(!group) {
            return res.status(400).json({
                message: 'Group not found'
            })
        }
        const user = await userModel.findById(id);

        if(!user) {
            return res.status(400).json({
                message: 'User not found'
            })
        }

        const request = new requestModel({
            groupId,
            groupName: group.groupName,
            userId: id,
            userInfo: user.fullName
        });

        await request.save();

        res.status(200).json({
            message: 'Request sent successfully',
            data: request
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.acceptRequest = async (req, res) => {
    try {
        // Get the admin id from the request user
        const adminId = req.user.id;
        // Get the request Id from the params
        const { requestId } = req.params;
        // Check if request exits
        const request = await requestModel.findById(requestId)
        if (!request) {
            return res.status(404).json({
                message: 'Request Not Found'
            })
        }

        if (request.status === 'Accept' || request.status === 'Rejected') {
            return res.status(400).json({
                message: 'Request alreaady processsed'
            })
        }
        // console.log(request.groupId)
        const group = await groupModel.findById(request.groupId);

        if(!group) {
            return res.status(404).json({
                message: 'Group not found'
            })
        }

        if(group.createdBy.toString() !== adminId) {
            return res.status(403).json({
                message: 'Unauthorized: Not an admin'
            })
        }

        group.members.push(request.userId);
        request.status = 'Accepted';

        await group.save();
        await request.save();

        res.status(200).json({
            message: 'Request Accepted successfully',
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            messagge: 'Something went wrong'
        })
    }
}

exports.rejectRequest = async (req, res) => {
    try {
        // Get the admin id from the request user
        const adminId = req.user.id;
        // Get the request Id from the params
        const { requestId } = req.params;
        // Check if request exits
        const request = await requestModel.findById(requestId)
        if (!request) {
            return res.status(404).json({
                message: 'Request Not Found'
            })
        }

        if (request.status === 'Accepted' || request.status === 'Rejected') {
            return res.status(403).json({
                message: 'Request already accepted or rejected'
            })
        }

        const group = await groupModel.findById(request.groupId);

        if(!group) {
            return res.status(404).json({
                message: 'Group not found'
            })
        }

        if (group.createdBy.toString() !== adminId) {
            return res.status(403).json({
                message: 'Unauthorized: Not an admin'
            })
        }


        request.status = 'Rejected';

        await request.save();

        res.status(200).json({
            message: 'Request Rejected successfully'
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.allRequestForAdmin = async (req, res) => {
    try {
        const { id } = req.user;
        const { groupId } = req.params;

        const group = await groupModel.findById(groupId);
        if(!group) {
            return res.status(404).json({
                message: 'Group not found'
            })
        }

        if(group.createdBy.toString() !== id) {
            return res.status(403).json({
                message: 'Unauthorized to view request, Not an admin'
            })
        }

        const requests = await requestModel.find({ groupId });

        res.status(200).json({
            message: 'All requests retrieved successfully',
            data: requests
        })
    } catch (error) {
       res.status(500).json({
            message: 'Something went wrong'
        }) 
    }
}