const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors');
const app = express();

const db = config.get('mongoURI');

const usersRoutes = require('./api/routes/users');
const catagoriesRoutes = require('./api/routes/catagories');
const servicesRoutes = require('./api/routes/services');
const reviewsRoutes = require('./api/routes/reviews');

// Connecting to database
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('db connected'))
    .catch((err) => console.log(err))
//set mongoose's Promise equal to global Promise since mongoose's Promise version is depricated
mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Routes to handle requests
app.use('/users', usersRoutes);
app.use('/catagories', catagoriesRoutes);
app.use('/services', servicesRoutes);
app.use('/reviews', reviewsRoutes);

app.use((req, res, next) => {
	const error = new Error('Not Foud');
	error.status = 404;
	next(error);
});

//error handling middleware
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({ 
        error: err.message 
    });
});

module.exports = app;