const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Question = require('./Question');

const UserSchema =  new Schema({

    name:{
        type: String,
        required: [true, "please provide a name"] 
    },

    email : {
        type: String,
        required: [true,"please provide a email"], 
        unique: true, 
        match : [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            "please provide a valid email address"
        ]

    },
    role:{ 
        type: String,
        default: "user", 
        enum : ["user", "admin"]  
    },
    password: {
        type: String,
        minlength: [6,"please enter your password with min length 6"],
        required: [true,"please provide a password"],
        select: false 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String
    },
    about: { 
        type: String
    },
    place: {
        type: String
    },
    website:{
        type: String
    },
    profile_image: {
        type: String,
        default: "default.jpg" 
    },
    blocked: {  
        tpye: Boolean, 
        default: false
    },
    resetPasswordToken: {
        tpye: String
    },
    resetPasswordExpire:{
        type: Date
    }
});

// UserSchema Methods
UserSchema.methods.generateJwtFromUser = function(){ 
    const {JWT_SECRET_KEY, JWT_EXPIRE} =  process.env; 
    const payload = {
        id : this._id,  
        name: this.name    
    }; 
    //generate token
    const token = jwt.sign(payload, JWT_SECRET_KEY,{
        expiresIn: JWT_EXPIRE // options 
    });
    return token;
};

UserSchema.methods.getResetPasswordTokenFromUser = function() {

    const randomHexString = crypto.randomBytes(15).toString("hex"); 
    const {RESET_PASSWORD_EXPIRE} = process.env; 
    const resetPasswordToken = crypto

    .createHash("SHA256") // SHA256 algorithm
    .update(randomHexString)  
    .digest("hex")  
    
    return resetPasswordToken;

    this.resetPasswordToken= resetPasswordToken;
    this.resetPasswordExpire =  Date.now() + parseInt(RESET_PASSWORD_EXPIRE);   
};

// documents: https://mongoosejs.com/docs/middleware.html
UserSchema.pre("save", function(next) {
      
    if(!this.isModified("password")) { 
        next(); 
    };

    bcrypt.genSalt(10, (err, salt) => { 
      if(err) next(err);   
        bcrypt.hash(this.password, salt, (err, hash) => {
          if(err) next(err);       
            this.password= hash;       
            next();   
        });
    });
});

UserSchema.post("remove", async function(){ 
    await Question.deleteMany({
        user : this._id
    });
});

module.exports = mongoose.model("User",UserSchema); 