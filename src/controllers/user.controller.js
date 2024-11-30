import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"



const registerUser = asyncHandler(async(req,res)=>{
    //Step:-1  get users details from frontend
    const {fullName, email,username,password} = req.body
    console.log("email",email);
    
    //Step 2:- validation- not empty
    // Method 1:- Basic way of doing validation
 
    // if(fullName === ""){
    //     throw new ApiError(400,"fullname is required")
    // }
    // if(email === ""){
    //     throw new ApiError(400,"email is required")
    // }
    // if(username === ""){
    //     throw new ApiError(400,"username is required")
    // }
    // if(password === ""){
    //     throw new ApiError(400,"password is required")
    // }


    // Method 2:- Advance/Professional Way of doing validation

    if(
        [fullName, email, username, password].some((field) => 
            field?.trim() ==="")
    )
    {
        throw new ApiError(400,"All fields are required")
    }

    //Step 3:-  check if user already exist: check from username and email
    
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already existed")
    }

    //Step 4:- check for images, check for avatar
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) &&  (req.files.coverImage.length>0)){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    //Step5:- upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    //Step 6:- create user object - create entry in db 
    const user = await User.create({
       fullName,
       avatar : avatar.url,
       coverImage : coverImage?.url || "",
       email,
       password,
       username:username.toLowerCase()
    })

    //Step 7:-  remove password and refresh token field from response

    //Step 8:-  check for user creation
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the User");
        
    }
    //Step 9:-  return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export {registerUser}