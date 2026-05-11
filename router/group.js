const router = require('express').Router();
const { createGroup, getAllGroup, removeMemberFromGroup, getOneGroup } = require('../controller/group');
const { authentication } = require('../middlewares/auth');

router.post('/', authentication, createGroup);
router.get('/', getAllGroup);
router.get('/:id', getOneGroup);
router.delete('/:groupId/:memberId', authentication, removeMemberFromGroup);

module.exports = router;