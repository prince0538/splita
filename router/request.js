const router = require('express').Router();
const { createRequest, acceptRequest, rejectRequest, allRequestForAdmin } = require('../controller/request');
const { authentication }  = require('../middlewares/auth');

router.post('/request/:groupId', authentication, createRequest);

router.put('/request/:requestId', authentication, acceptRequest);
router.put('/request-decline/:requestId', authentication, rejectRequest);
router.get('/request-all/:groupId', authentication, allRequestForAdmin);

module.exports = router;