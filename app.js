if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}
console.log(process.env.CLOUDINARY_KEY);
console.log(process.env.CLOUDINARY_SECRET);



const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const Campground=require("./models/campground");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const catchAsync=require("./utils/catchAsync");
const ExpressError=require("./utils/ExpressError");
const Joi = require('joi');
const session=require("express-session");
const flash=require('connect-flash');
const User=require('./models/user');



const{campgroundSchema}=require("./schemas");
const{reviewSchema}=require("./schemas");
const Review = require("./models/review");
const campgroundsRoute=require("./routes/campgrounds");
const reviewsRoute=require("./routes/reviews");
const usersRoute=require("./routes/users");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const helmet = require("helmet");
const MongoStore = require('connect-mongo')(session);

const dbUrl=process.env.DB_URL||"mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl,
 {useNewUrlParser: true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
})
.then(()=>{
    console.log("mongo connection successfully!!");
})
.catch((e)=>{
    console.log(e+"mongo connection error");
})

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const secret=process.env.SECRET||"thisshouldbeabettersecret";
const store=new MongoStore({
    url:dbUrl,
    secret:secret,
    touchAfter:24*60*60
})
store.on("error",function(){
    console.log("session store error")
})

const sessionConfig={
    store,
    name:"session",
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000 * 60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());

//helmet set up
app.use(helmet({contentSecurityPolicy: false}));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dtazzwys1/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




//passport
passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//set locals
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use(express.static(path.join(__dirname,'public')));
//set routes
app.use('/campgrounds',campgroundsRoute);
app.use("/campgrounds/:id/reviews",reviewsRoute);
app.use('/',usersRoute);

app.get("/",(req,res)=>{
    res.render("home");
})

app.get("/fakeUser",async(req,res)=>{
    const user=new User({email:'alex@gamil.com',username:'Samuel'});
    const newUser=await User.register(user,'123');
    res.send(newUser);
})


app.all('*',(req,res,next)=>{
      next( new ExpressError("Page not found",404));
})

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message)
        err.message="Oh something went wrong";
    res.status(statusCode).render("error",{error:err});
})
const port=process.env.PORT||3000;
app.listen(port,(req,res)=>{
    console.log(`${port} port is listening`);
})