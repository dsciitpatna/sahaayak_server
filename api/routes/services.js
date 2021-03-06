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
    const { business,contact,location } = req.body;
    const {categoryName} = business;
    // Validation
    let validator = new v(req.body, {
        //empty for now
    });


            const vendor = req.user.id;
            const newService = new Service({
                business,
                contact,
                vendor,
                location
            });

            Service.findOne({vendor,categoryName})
                .then(service => {
                    if (service) return res.status(400).json({ msg: 'Vendor service already exists' });

                    if (req.user.isVendor) {
                        newService
                            .save()
                            .then(service => {
                                res.status(200).json({
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

// Get a service by ID  (access: all)
router.get('/:serviceId', (req, res) => {
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

// Get services by categoryName  (access: all)
router.get('/categoryName/:categoryName', (req, res, next) => {
    const categoryName=req.params.categoryName;
    Service.find({'business.categoryName': categoryName})
        .populate('vendor', '_id name')
        .exec()
        .then(services => {
            if (services) {
                res.status(200).json({
                    services: services
                });
            } else {
                res.status(404).json({
                    message: "No entry found"
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


// Get all services provided by a vendor

router.get('/vendors/:vendorId', checkAuth, (req, res) => {
    const vendorId = req.params.vendorId;
    Service.find({ vendor: vendorId }).
        exec().
        then(services => {
            if (services.length !== 0) {
                res.status(200).json({
                    services: services
                })
            }
            else {
                res.status(400).json({
                    message: "No entry for given vendor id"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

// Delete all services provided by a vendor (Access: this.vendor & Admin)

router.delete('/vendors/:vendorId', checkAuth, (req, res) => {
    const vendorId = req.params.vendorId;
    if(!req.user.isAdmin && (req.user.isVendor && req.user.id!==vendorId)) {
        return res.status(500).json({
            message: "Unauthorized Access"
        })
    }
    Service.find({vendor: vendorId})
        .exec()
        .then(services => {
            if (services.length !== 0) {
                Service.deleteMany({vendor: vendorId})
                .then( (services)=> {
                    res.status(200).json({ msg: "All services deleted" })
                })
                .catch(err => {
                    res.status(404).json({
                        error: err
                    })
                })

            }
            else {
                res.status(400).json({
                    message: "No entry for given vendor id"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


// Update a service by Id  (access: vendor)
router.patch('/:serviceId', checkAuth, (req, res) => {
    const id = req.params.serviceId;
    // const obj = {};
    // if (name) {
    //     obj.name = 'required|minLength:5';
    // }

    // Validation
    //let validator = new v(req.body, obj);

            Service.findById(id)
                .exec()
                .then(service => {
                    if (service) {
                        if (req.user.isVendor) {
                            Service.findByIdAndUpdate(id, req.body, { new: true }).then((updatedService) => {
                                res.status(200).json(updatedService);
                            });
                        } else {
                            return res.status(422).json({
                                message: "Unauthorised Request"
                            })
                        }
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
// Api to delete a service
router.delete('/:serviceId', checkAuth, (req, res) => {

    const id = req.params.serviceId;
    const vendorId = req.user.id;
    const { isVendor, isAdmin } = req.user
    if (isVendor && !isAdmin) {
        Services.findOne({ _id: id, vendor: vendorId })
            .exec()
            .then(service => {
                if (service) {
                    Service.findByIdAndRemove(id)
                        .exec()
                        .then(servic => {
                            res.status(200).json({ msg: "Service deleted" })
                        })
                        .catch(err => {
                            res.status(404).json({
                                error: err
                            })
                        })
                }
                else {
                    res.status(404).json({
                        message: "No Entry Found"
                    })
                }
            })
            .catch(err => {
                error: err
            })
    }

    if ( isAdmin && !isVendor ) {
        Services.findOne({ _id: id })
            .exec()
            .then(service => {
                if (service) {
                    Service.findByIdAndRemove(id)
                        .exec()
                        .then(servic => {
                            res.status(200).json({ msg: "Service deleted" })
                        })
                        .catch(err => {
                            res.status(404).json({
                                error: err
                            })
                        })
                }
                else {
                    res.status(404).json({
                        message: "No Entry Found"
                    })
                }
            })
            .catch(err => {
                error: err
            })
    }

    else {
        res.status(500).json({
            message: "Unauthorized Access"
        })
    }

})



module.exports = router;