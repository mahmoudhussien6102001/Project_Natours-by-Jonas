const Tour = require('./../models/toursmodel');
const catchAsync =require('./../utils/catchAsync');
const AppError =require('./../utils/AppError');
const factory = require('./../controllers/handleFactory');
exports.aliasTopTours=(req,res,next)=>{
    req.query.limit='4';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
};
/*
exports.allTours =catchAsync(async(req, res )=>{
    
        // build query 
        // 1 ) filtering 
        /*
        const queryObj ={... req.query};
        const excludedField= [ 'page', 'sort', 'limit','fields'];
        excludedField.forEach(ele=> delete queryObj[ele]);
        // 2) advanced filtering
        // tours?duration[gte]=5 
        const  querystr = JSON.stringify(queryObj);
        const queryStr = querystr.replace((/\b gte|gt|lte|lt\b/g),match => `$${match}`) ;

        // query 

        // access the query 
        let query =  Tour.find(JSON.parse(queryStr));
        
        // 3) sorting 
        // tours?sort=price,ratingsAverge
     /*  if (req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        console.log(sortBy)

        query = query.sort(sortBy)
      }else {
        query=query.sort("-createdAt")
      } */
      // 4 ) fields limiting 
      // in postman  ?fields=name,duration,price,difficulty   

     /*  if(req.query.fields){
        const fields = req.query.fields.split(',').join(' ');
        query =query.select(fields)
      }else{
        query =query.select('-__v');
      } 
      // 5)pagination  consist of skip and limit 
      /* const page = req.query.page *1 || 1 ;
      const limit = req.query.limit *1 || 100;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit); 
      
       
    
       const features = new APIFeatures(Tour.find(), req.query)
       .filter().sort().limitFields().paginate();


        const tours = await features.query;
        if(tours.length === 0){
            return next(new AppError('no tour found in Db ',404));
        }
            res.status(201).json({
                status: 'success',
                results:tours.length,
                data :{
                    tour : tours
                }
            })

       
    });
    */
    
    /*
    exports.getTours = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        try {
            const tour = await Tour.findById(id).populate('reviews');
            if (!tour) {
                return next(new AppError('Tour not found with that id', 404));
            }
            res.status(200).json({
                status: 'success',
                data: {
                    tour: tour
                }
            });
        } catch (err) {
            return next(new AppError('Error retrieving tour', 500));
        }
    });
    */
    /*

exports.createTours = catchAsync(async (req, res) => {
    
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
     
});
*/
/*
exports.updateTours =catchAsync( async (req, res) => {
         const tour = await Tour.findByIdAndUpdate(req.params.id ,req.body,{
        new :true,
        runValidators :true
        });
    res.status(200).json({
        status: 'success',
        results:tour.length,
        data: {
            tour
        }
    });


});
*/
exports.deleteTours=factory.deleteOne(Tour);
exports.updateTours=factory.updateOne(Tour);
exports.createTours=factory.createOne(Tour );
exports.allTours=factory.getAll(Tour);
exports.getTours=factory.getOne(Tour ,{path :'reviews'});
/*
exports.deleteTours =catchAsync( async (req, res) => {
        const id = req.params.id;    
        await Tour.findByIdAndDelete(id);

        res.status(204).json({
            status: 'success',
            data: {
                tour:null
            }
        });
    
});
*/
exports.getTourStat =catchAsync( async (req, res) => {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    // _id :null 
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avagRatings: { $avg: '$ratingsAverage' },
                    avagPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: {
                    avagPrice: 1
                }
            },
           /*  {
                $match: {
                    _id: { $ne: 'EASY' }
                }
            } */
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });

     
});

exports.getMonthelyPlan = catchAsync (async (req, res) => {
        const year = parseInt(req.params.year);
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numToursStart: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $sort: {
                    numToursStart: -1
                }
            },
            {
                $addFields: {
                    monthNumber: '$_id'
                }
            },
            {
                $project: {
                    _id: 0 
                }
            },
            {
                $limit: 6
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });
     
});
