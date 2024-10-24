import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // It is used to access cookie from the browser so that we can do crud operations on it.
const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"})); // this is used to accept json data.
app.use(express.urlencoded({extended:true , limit:"16kb"})); // this is to accept data sent through urls.
// sirf app.use(express.urlencoded()) likh kr bhi kamm chal jayega pr {app.use(express.urlencoded({extended:true})) } extended humm use krta hai jissa humm object ka aandr object use krskta hai.
app.use(express.static("public")); // It is used to store images,pdf and other things in public folder. 
app.use(cookieParser());

export {app}