const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const v = require('node-input-validator');

const checkAuth = require('../middleware/auth');

const Services = require('../models/service');

// Get a service by ID  (access: all)
router.get('/:serviceId',(req, res) => {
    const id = req.params.serviceId;
    Service.findById(id)
        .exec()
        .then(service => {
            //console.log(user);
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