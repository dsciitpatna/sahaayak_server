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
    const service = req.params.serviceId;
    const { rating, review } = req.body;

    // Validation
    let validator = new v({ rating, review }, {
        rating: 'required|integer',
        review: 'required|string'
    });
    validator.check().then(function (matched) {
        if (!matched) {
            return res.status(422).json({ msg: validator.errors });
        }
        const user = req.user.id;
        const newReview = new Reviews({
            user,
            rating,
            service,
            review
        })
        Reviews.findOne({ user: user, service: service })
            .exec()
            .then(review => {
                if (review) {
                    return res.status(400).json({
                        message: "Can not review more then once"
                    })
                }
                Services.findById(service)
                    .exec()
                    .then(service => {
                        if (service.vendor == user) {
                            return res.status(401).json({
                                message: "Cannot review own service"
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


            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })


    })

})
