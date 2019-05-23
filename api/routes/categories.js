const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const v = require('node-input-validator');

const checkAuth = require('../middleware/auth');

const Categories = require('../models/category');

router.get("/", (req, res, next) => {
    Categories.find()
        .exec()
        .then(category => {
            if (category) {
                res.status(200).json({
                    categories: category
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



router.post('/',checkAuth,(req,res)=>{
    const {name}=req.body;
    const isAdmin=req.user.isAdmin;

    if(!isAdmin) return res.status(422).json({msg: "Unauthorised Request"})

    let validator = new v(req.body, {
        name: 'required|minLength:4'
    });

    validator.check().then(function(matched){
        if(!matched) {
            res.status(422).json({msg:validator.errors})
        } else {
            const newCategory = new Categories({
                name
            })

            Categories.findOne({name})
                      .then(category=>{
                        if (category) return res.status(400).json({ msg: 'Category Already exists' })  

                        newCategory
                            .save()
                            .then(category=>{
                                return res.json(category)
                            })
                      })
                      .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            })
                       })  
        }
    })

})

router.delete('/:categoryId', checkAuth, (req, res) => {
    const id = req.params.categoryId;
    const isAdmin = req.user.isAdmin;
    
    if (isAdmin) {
        Categories.remove({ _id: id }, (err) => {
            if (!err) {
                return res.status(200).json({
                    message: "Successfully Removed"
                })
            } else {
                res.status(500).json({
                    error: err
                })
            }
        })
    } else {
        res.status(422).json({
            message: "Unauthorized Access"
        })
    }

})


router.patch('/:categoryId',checkAuth,(req,res)=>{
    const id = req.params.categoryId;
    const isAdmin = req.user.isAdmin;

    if(!isAdmin) return res.status(422).json({msg: "Unauthorised Request"})

    let validator = new v(req.body, {
        name: 'required|minLength:7'
    });

    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).json({ msg: validator.errors });
        } else {
            Categories.findById(id)
            .exec()
            .then(category => {
                if (category) {
                    Categories.findByIdAndUpdate(id,req.body,{new:true}).then((updatedCategory)=>{
                        res.status(200).json(updatedCategory);
                    });
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


module.exports = router;
