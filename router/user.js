const router = require('express').Router();
const { createUser, updateUser, verifyEmail, login, forgetPassword, resetPassword, changePassword, loginWithGoogle, getAllUser, deleteUser } = require('../controller/user');
const { upload } = require('../middlewares/multer');
const { profile, loginProfile } = require('../middlewares/passport')
const { authentication } = require('../middlewares/auth')
const { userValidator } = require('../middlewares/validator')

router.post('/', upload.single('profilePicture'), userValidator, createUser);

router.put('/update/:id', upload.single('profilePicture'), userValidator, updateUser);

router.post('/verify-email', verifyEmail);

router.post('/login', login);
router.post('/forget-password', forgetPassword);

router.post('/reset-password', resetPassword);
router.post('/change-password', authentication, changePassword);

router.get('/auth/google', profile);
router.get('/auth/google/callback', loginProfile, loginWithGoogle);

router.get('/all-users', getAllUser)
router.delete('/delete/:id', deleteUser)

module.exports = router;