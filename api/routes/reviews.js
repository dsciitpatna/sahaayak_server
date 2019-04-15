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
        .populate('user', '_id name')
        .populate('service')
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

// Api for changing or updating the review (Access : loggedinuser == serviceId->review->userId)

router.patch('/:serviceId', checkAuth, (req, res) => {
    const serviceId = req.params.serviceId
    const loggedUserId = req.user.id
    Reviews.findOne({ service: serviceId })
        .exec()
        .then(review => {
            if (!review) {
                return res.status(404).json({
                    message: "No Reviews found"
                })
            }
            if (review.user == loggedUserId) {
                const { rating, review } = req.body
                let validator = new v(req.body, {
                    rating: 'required|integer',
                    review: 'required|string'
                });
                validator.check()
                    .then(function (matched) {
                        if (!matched) {
                            return res.status(422).json({ msg: validator.errors });
                        }
                        Reviews.findOneAndUpdate({ user: review.user, service: serviceId }, { rating, review }, { new: true })
                            .then(review => {
                                res.status(200).json({
                                    review: review
                                })
                            })

                    })
            }
            else {
                return res.status(401).json({
                    message: "Unathorised"
                })
            }

        })
        .catch(err => {
            error: err
        })
})