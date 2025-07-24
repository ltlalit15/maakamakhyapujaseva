const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwtToken = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        default: "user",
    },
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name can't Exceed 30 Characters"],
        minLength: [3, "Name Should have more than 4 Characters"],
    },
    email: {
        type: String,
        required: [true, "Enter Your Email Address"],
        unique: true,
        validate: [validator.isEmail, "Please Enter A Valid Email Address"],
    },
    password: {
        type: String,
        required: [true, "Enter Your Password"],
    },
    avtar: {
        url: {
            type: String,
            required: true
        },
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetpasswordToken: String,
    resetpasswordExpire: Date,
});

// Encryption through Bcrypt.js
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
});

// JWT Token
userSchema.methods.getJWTTOKEN = function () {
    return jwtToken.sign({ id: this._id }, "Kuch Bhi", {
        expiresIn: "100d",
    });
};

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

// **Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
    //   *Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex"); //hex will generating random digits

    // Hashing and adding resetPasswordToken to UserSchema
    this.resetpasswordToken = crypto
        .createHash("sha256")
        .digest(resetToken)
        .toString("hex");
    //sha256 is an algorithm to generate hashCode

    this.resetpasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
