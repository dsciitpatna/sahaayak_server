const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const v = require('node-input-validator');

const checkAuth = require('../middleware/auth');

const Services = require('../models/service');

//Api for getting all services (Access: all)
router.get("/", (req, res, next) => {
    Service.find()
        .exec()
        .then(services => {
            if (services) {
                res.status(200).json({
                    services: services
                });
            } else {
                res.status(404).json({
                    message: "no entry found"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

//Api for posting a service (Access: vendor)
router.post("/", checkAuth, (req, res, next) => {
    const { name, vendorId, vendorName, details, rating } = req.body;

    // Validation


    const newService = new Service({
        name,
        vendorId,
        vendorName,
        details,
        rating
    });
  
    Service.findOne({ vendorId,name })
        .then(service => {
            if (service) return res.status(400).json({ msg: 'Vendor service already exists' });

            if (req.user.isVendor) {
                newService
                    .save()
                    .then(service => {
                        res.json({
                            service: service
                        })
                    })
                } else {
                res.status(401).json({
                    message: "Unautherized access"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

module.exports = router;