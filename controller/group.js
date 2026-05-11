const groupModel = require('../models/group');

exports.createGroup = async(req, res) => {
    
    try {
        
        const { groupName, contributionAmount, contributionFrequency, payoutAmount, describeGroup, TotalMembers} = req.body;
        const newGroup = await groupModel.create({
            groupName,
            contributionAmount,
            contributionFrequency,
            payoutAmount,
            describeGroup,
            TotalMembers,
            createdBy: req.user.id
        })
        newGroup.members.push(req.user.id);
        await newGroup.save();



        res.status(201).json({
            message: 'Group created successfully',
            data: newGroup
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.getAllGroup = async (req, res) => {
    try {
        const group = await groupModel.find().populate('members', 'fullName').sort({ createdAt: -1 });

        res.status(200).json({
            message: 'All groups retrieved successfully',
            data: group
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.getOneGroup = async (req, res) => {
    try {
        
        const {id} = req.params;
        const group = await groupModel.findById(id).populate('members', 'fullName');
        if(!group) {
            return res.status(404).json({
                message: 'Group not found'
            })
        }

        res.status(200).json({
            message: 'Group retrieved successfully',
            data: group
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}

exports.removeMemberFromGroup = async (req, res) => {
    try {
        const { id } = req.user;
        const { groupId, memberId } = req.params;

        const group = await groupModel.findById(groupId);
        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            })
        }

        if (group.createdBy.toString() !== id) {
            return res.status(403).json({
                message: 'Unauthorized: Not an admin'
            })
        }

        if(group.createdBy.toString() === memberId) {
            return res.status(403).json({
                message: 'Unauthorized Access, Cannot remove admin'
            })
        }

        const memberIndex = group.members.findIndex((element) => element.toString() === memberId);
        if(memberIndex === -1) {
            return res.status(404).json({
                message: 'Member not found in the group'
            })
        }

        group.members.splice(memberIndex, 1);
        await group.save();

        res.status(200).json({
            message: 'Member removed successfully'
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}