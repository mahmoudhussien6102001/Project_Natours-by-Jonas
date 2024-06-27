const catchAsync = require('./../utils/catchAsync');
const AppError = require ('./../utils/AppError');
const APIFeatures = require('./../utils/APIFeatures');


exports.deleteOne = Model =>
catchAsync(async (req,res ,next)=>{
    const docu = await Model.findByIdAndDelete(req.params.id);
    if(!docu){
        return next(new AppError('not  document found in db' ,404));
    }

    res.status(200).json({
        status:'success' ,
        data:null
    })
});

exports.updateOne =Model=>
catchAsync(async (req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    if(!doc){
        return next(new AppError('not  document found in db' ,404));
    }
    res.status(200).json({
        status:'success',
        data :{
            data :doc
        }
    })
})


exports.createOne=Model=>
catchAsync(async (req,res ,next )=>{
    const newDoc = await Model.create(req.body);
    res.status(200).json({
        status:'sucess' ,
        data:{
            data :newDoc
        }
    });
});


exports.getOne=(Model ,popOptions)=>
catchAsync (async (req ,res ,next )=>{
   let query = Model.findById(req.params.id) ;
    if(popOptions) query =query.populate('reviews');
    const doc = await query;
    if(!doc) {
        return next (new AppError ('no document found in db ' ,404));
    }
    res.status(200).json({
        status :'success' ,
        data :{
            data:doc
        }
    })
});

exports.getAll = Model =>
catchAsync (async (req,res ,next )=>{
    // to allow for nested get reviews on tour 
    let filter = {}
    if(req.params.tourId) filter ={tour : req.params.tourId};
    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();


     const doc = await features.query.explain();
     res.status(200).json({
        status:'success' ,
        results :doc.length ,
        data :{
            data :doc
        }
     });

});

