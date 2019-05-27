const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'./uploads')
    },
    filename: (req,file,cb)=>{
        cb(null,Date().toString()+'.jpg')
    }
})
const fileFilter  = (req,file,cb)=>{
    if(file.mimetype === 'image/jpeg'){
        cb(null,true)
    }
    else{
        cb(null,false)
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize : 1024*1024*5
    },
    fileFilter: fileFilter
});
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
router.post("/",checkAuth,upload.single('vendorImage') ,(req, res, next) => {
    const { name, detail, rating, categoryName } = req.body;
    const vendorImagePath = req.file.path
    // Validation
    let validator = new v(req.body, {
        name: 'required|minLength:5',
    });

    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).json({ msg: validator.errors });
        }
        else {
            const vendor = req.user.id;
            const newService = new Service({
                name,
                categoryName,
                vendor,
                detail,
                rating,
                vendorImagePath
            });

            Service.findOne({ vendor, categoryName })
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
        }
    });

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
    Service.find({categoryName})
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


// Update a service by Id  (access: vendor)
router.patch('/:serviceId', checkAuth, (req, res) => {
    const id = req.params.serviceId;
    const { name, detail, rating } = req.body;

    const obj = {};
    if (name) {
        obj.name = 'required|minLength:5';
    }

    // Validation
    let validator = new v(req.body, obj);

    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).json({ msg: validator.errors });
        } else {
            Service.findById(id)
                .exec()
                .then(service => {
                    if (service) {
                        if (req.user.isVendor) {
                            Service.findByIdAndUpdate(id, req.body, { new: true }).then((updatedService) => {
                                res.status(200).json(updatedService);
                            });
                        } else {
                            res.status(422).json({
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
        }
    });
})
// Api to delete a service
router.delete('/:serviceId', checkAuth, (req, res) => {

    const id = req.params.serviceId;
    const vendorId = req.user.id;

    const { isVendor, isAdmin } = req.user
    if (isVendor || isAdmin) {
        Services.findOne({ _id: id, vendor: vendorId })
            .exec()
            .then(service => {
                if (service) {
                    Service.findByIdAndRemove(id)
                        .exec()
                        .then(servic => {
                            res.status(200).json({ service: servic })
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