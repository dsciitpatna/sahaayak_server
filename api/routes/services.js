const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const v = require('node-input-validator');

const checkAuth = require('../middleware/auth');

const Services = require('../models/service');

module.exports = router;

router.delete('/:serviceId', checkAuth, (req, res) => {
    const id = req.params.serviceId;
    const { isVendor, isAdmin } = req.user
    if (isVendor || isAdmin) {
        Service.remove({ vendorId: id }, (err) => {
            if (!err) {
                return res.status(200).json({
                    message: "Successfully Removed"
                })
            }
            else {
                res.status(500).json({
                    error: err
                })
            }
        })
    }
    else {
        res.status(500).json({
            message: "Unauthorized Access"
        })
    }

})