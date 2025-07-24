const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const User = require('../models/userModels');
const tokenEase = require('../utils/tokenEase');
const sendMail = require('../utils/sendMail');
const Cloudinary = require('cloudinary');

// Register A User`
exports.registerUser = AsyncAwaitError(async (req, res, next) => {
    try {
        const img = req.uploadedImageUrl
        const data = await User.create(
            {
                avtar: img,
                ...req.body
            }
        )
        tokenEase(data, 201, res);

    } catch (error) {
        res.status(404).json(error.message)
    }
})

// Register A User`
// exports.registerUser = AsyncAwaitError(async (req, res, next) => {
//     const { name, email, password } = req.body;

//     const myCloud = await Cloudinary.v2.uploader.upload(req.body.avatar, {
//         folder: "ProfileImages",
//         width: 150,
//         crop: "scale"
//     })
//     const ourUser = await User.create({
//         name, email, password,
//         profilepicture: {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url
//         }
//     });

//     // getting the secret Token
//     tokenEase(ourUser, 201, res);
// })

// Login Users
exports.loginUser = AsyncAwaitError(async (req, res, next) => {
    const { email, password } = req.body;

    // Checking if the user have the correct email and password or not
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please Enter Correct Email and Password"
        })
    }
    //else Finding the User In Database 
    const findUser = await User.findOne({ email }).select("+password");

    if (!findUser) {
        return res.status(401).json({
            success: false,
            message: "Invalid Email and Password"
        })
    }

    // Knowing the password is matched or not
    const isPasswordMatched = await findUser.comparePassword(password);

    if (!isPasswordMatched) {
        return res.status(401).json({
            success: false,
            message: "Invalid Email and Password"
        })
    }

    tokenEase(findUser, 200, res);
});


// Logout User
exports.logOut = AsyncAwaitError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "User Logged Out"
    });
})


// Forget Password
exports.forgetPassword = AsyncAwaitError(async (req, res, next) => {
    const forgetUser = await User.findOne({ email: req.body.email });

    if (!forgetUser) {
        return next(new res.status(404).json({
            success: false,
            message: "User Not Found"
        }))
    }
    const resetToken = forgetUser.getResetPasswordToken();

    await forgetUser.save({ validateBeforeSave: false });

    const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const mailMessage = `Your Password Reset Token is: ${resetPasswordURL}  // If you have not requested the mail then please ignore it`;

    try {
        await sendMail({
            email: forgetUser.email,
            subject: `E-commerce Website Password Recovery Mail`,
            message: `Recover`
        });
        res.status(200).json({
            success: true,
            message: `Mail is sent to ${forgetUser.email} successfully`
        })
    }

    catch (error) {
        forgetUser.resetPasswordToken = undefined;
        forgetUser.resetPasswordExpire = undefined;

        await forgetUser.save({ validateBeforeSave: false });
        res.status(500).json({
            message: error.message,
            success: false,
        })
    }
});


// Get User from Details for Updating Profile
exports.getUserDetails = AsyncAwaitError(async (req, res, next) => {
    const profileUser = await User.findById(req.ourUser.id)

    res.status(200).json({
        success: true,
        profileUser,
    })
});

// Update User Password for Updating Profile
exports.updatePassword = AsyncAwaitError(async (req, res, next) => {
    const user = await User.findById(req.ourUser.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return res.status(400).json({
            success: false,
            message: "Old Password is Incorrect"
        })
    }

    if (req.body.newPassword != req.body.confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Password is not Matching"
        })
    }

    user.password = req.body.newPassword;
    await user.save();

    tokenEase(user, 200, res);

});

// Update User Profile
exports.updateProfile = AsyncAwaitError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email  //updating.....
    }

    if (req.body.avatar !== "") {
        const user = await User.findById(req.ourUser.id);

        const imageId = user.profilepicture.public_id;

        await Cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await Cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.profilepicture = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        };
    }

    const updatedUser = await User.findByIdAndUpdate(req.ourUser.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        updatedUser
    });
});


// Below Logic is for ADMIN Only

// Get all Users --ADMIN
exports.getAllUsers = AsyncAwaitError(async (req, res, next) => {
    const getUser = await User.find();

    res.status(200).json({
        success: true,
        getUser
    });
});

// Get single Users --ADMIN
exports.getAUsers = AsyncAwaitError(async (req, res, next) => {
    const getUser = await User.findById(req.params.id);

    if (!getUser) {
        res.json({
            message: `User doesn't Exist with ID: ${req.params.id}`
        });
    }
    res.status(200).json({
        success: true,
        getUser
    });
});

// Update User Profile - ADMIN
exports.updateUser = AsyncAwaitError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        role: req.body.role                //updating.....
    }
    if (!newUserData) {
        res.json({
            message: `User doesn't Exist Show Can't Update`
        });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        updatedUser
    });
});

// Deleting the User -ADMIN
exports.DeleteUsers = AsyncAwaitError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.json({
            message: `User doesn't Exist with ID: ${req.params.id}`
        });
    }

    // const imageId = user.profilepicture.public_id;
    // await Cloudinary.v2.uploader.destroy(imageId);

    await user.remove();
    res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
        user
    });
});
