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
        .populate('vendor', '_id name')
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
    const { name, detail, rating } = req.body;

    // Validation
    let validator = new v(req.body, {
        name: 'required|minLength:5'
    });

    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).json({ msg: validator.errors });
        }
        else {
            const vendor = req.user.id;
            const newService = new Service({
                name,
                vendor,
                detail,
                rating
            });
          
            Service.findOne({ vendor,name })
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
        }
    });
    
});

// Get a service by ID  (access: all)
router.get('/:serviceId',(req, res) => {
    const id = req.params.serviceId;
    Service.findById(id)
        .populate('vendor', '_id name')
        .exec()
        .then(service => {
            if (service) {
                res.status(200).json({
                    service: service
                })
            } else {
                res.status(404).json({
                    message: "No entry found for given ID"
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;