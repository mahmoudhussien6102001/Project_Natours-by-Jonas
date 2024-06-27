
const mongoose =require('mongoose');
const fs =require('fs');
const Tour =require('./../models/toursmodel');
const User =require('./../models/usermodel');
const Review =require('./../models/reviewmodel');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

mongoose.connect('mongodb://127.0.0.1:27017/natours').then((con) => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json` ,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json` ,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json` ,'utf-8'));
const importData = async () =>{
    try {
    await Tour.create(tours);
    await User.create(users,{validateBeforeSave :false});
    await Review.create(reviews);
    console.log(" the data successfully loaded ! ");

} catch(err){
    console.log(err);
}
     process.exit();


};


const deleteData =async () => {
    try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("the delete successfully");

    }
    catch(err){
        console.log(err);
    }
      process.exit();

    
};
if(process.argv[2] ==='--import'){
    importData();
}else if(process.argv[2] ==='--delete'){
    deleteData();
}
