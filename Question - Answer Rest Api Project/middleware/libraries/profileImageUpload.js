
const multer = require("multer");
const path = require("path");
const CustomError = require("../../helpers/error/CustomError");
const storage = multer.diskStorage({

    destination: function(req, file, cb){  

        const rootDir = path.dirname(require.main.filename);
        cb(null, path.join(rootDir, '/public/uploads'));
    },
    filename: function (req,file,cb){
        //file-mimetype - image 
        const extension = file.mimetype.split('/')[1]; // image/png /
        
        req.savedProfileImage = "image_" + req.user.id + "." + extension; 
        cb(null, req.savedProfileImage); 
    }        
});
const fileFilter =(req, file, cb) => {

    let allowedMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/jpg']; 
    if (!allowedMimeTypes.includes(file.mimetype)) { 

        return cb(new CustomError("Please provide a valid image type",400),false); 
    }
    return cb(null,true); // true
};

const profileImageUpload = multer({storage, fileFilter}) 

module.exports = profileImageUpload;
