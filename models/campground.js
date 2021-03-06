const { required } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review");

const ImageSchema=new Schema({
    url:String,
    filename:String
})
ImageSchema.virtual('thumbnail').get(function(){
   return this.url.replace('/upload','/upload/w_200');
})
const opts = { toJSON: { virtuals: true } };
const campgroundSchema=new Schema({
    title:String,
    price:Number,
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    images:[ImageSchema],
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts)
campgroundSchema.virtual("properties.popUpText").get(function(){
    return `<a href="/campgrounds/${this._id}"><h4>${this.title}</h4></a>
            <p>${this.description.substring(0,40)}...</p>
            `
})
campgroundSchema.post('findOneAndDelete',async(doc)=>{
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews,
            }
        })
    }
})
module.exports=mongoose.model('Campground',campgroundSchema);