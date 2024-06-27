const path = require('path');
const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const toursRouter = require('./routes/toursRouter');
const usersRouter = require('./routes/usersRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');

dotenv.config(path.join(__dirname, 'config.env'));
app.use(express.static(path.join(__dirname, 'public')));
// server rendering 
app.set('view engine', 'pug');
app.set('views' ,path.join(__dirname ,'views'));    
// Middleware
app.use(helmet()); // Set security HTTP headers
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter); // Limit requests from the same API
app.use(express.json({ limit: '10kb' })); // Body parser - Parse incoming request bodies
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Development logging
}

// Routes
app.use('/', viewRouter);
app.use('/api/tours', toursRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewRouter);
// Middleware to handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/natours')
    .then(() => console.log('Connected to MongoDB done '))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Event listeners for uncaught exceptions and unhandled rejections
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err.message);
    console.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err.message);
    console.error(err.stack);
    process.exit(1);
});

const port = process.env.PORT || 2006;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});