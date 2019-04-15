const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const v = require('node-input-validator');

const checkAuth = require('../middleware/auth');

const Reviews = require('../models/review');

module.exports = router;



// Api for getting all reviews for a particular service Id

router.get('/:serviceId', checkAuth, (req, res) => {
    const serviceId = req.params.serviceId
    Reviews.find({ service: serviceId })
        .exec()
        .then(reviews => {
            if (reviews.length === 0) {
                return res.status(404).json({
                    message: "No reviews found"
                })
            }
            res.status(200).json({
                reviews: reviews
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

})