const express = require("express");
const { registerUser, loginUser, logOut, forgetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getAUsers, updateUser, DeleteUsers } = require("../controllers/userController");
const { AuthenticateTheUser, AuthorizedPerson } = require("../middleware/AuthenticateTheUser");
const router = express.Router();
const multer = require("multer"); // For handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadSingleImageToCloudinary = require("../middleware/img");


router.post("/register", upload.single('avtar'), uploadSingleImageToCloudinary, registerUser)
router.route('/login').post(loginUser);
router.route('/logout').get(logOut);
router.route('/password/forget').post(forgetPassword);
router.route('/me').post(AuthenticateTheUser, getUserDetails);
router.route('/password/update').put(AuthenticateTheUser, updatePassword);
router.route('/me/update').put(AuthenticateTheUser, updateProfile);
router.route('/admin/user').get(getAllUsers);
router.route('/admin/user/:id').get(getAUsers).put(updateUser).delete(DeleteUsers);


module.exports = router;
