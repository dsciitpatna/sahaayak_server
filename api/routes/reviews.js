const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const v = require('node-input-validator');

const checkAuth = require('../middleware/auth');

const Reviews = require('../models/review');
const Services = require('../models/service');

module.exports = router;

//Api for posting a review for a particular service Id

router.post('/:serviceId', checkAuth, (req, res) => {
    const serviceId = req.params.serviceId;
    const { rating, review } = req.body;

    // Validation
    let validator = new v({ rating, review }, {
        rating: 'required|integer',
        review: 'required|string'
    });
    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).json({ msg: validator.errors });
        }
        else {
            const userName = req.user.name;
            const userId = req.user.id;
            const newReview = new Reviews({
                userId: userId,
                userName: userName,
                rating,
                service: serviceId,
                review: review
            })
            Reviews.find({ userId: userId, service: serviceId })
                .exec()
                .then(review => {
                    if (review.length !== 0) {
                        return res.status(400).json({
                            message: "Can not review more then once"
                        })
                    }
                    newReview
                        .save()
                        .then(review => {
                            res.json({
                                review: review
                            })
                        })

                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    })
                })

        }
    })

})
