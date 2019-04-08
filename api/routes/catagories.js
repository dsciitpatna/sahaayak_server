const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const v = require('node-input-validator');

const checkAuth = require('../middleware/auth');

const Catagories = require('../models/catagory');

router.post('/',(req,res)=>{
    const {name}=req.body;
    const isAdmin=req.user.isAdmin;

    if(isAdmin) return res.status(422).json({msg: "Unauthorised Request"})


    let validator = new v(req.body, {
        name: 'required|minLength:7'
    });

    validator.check().then(function(matched){
        if(!matched)
        {
            res.status(422).json({msg:validator.errors})
        }
        else{
            const newCategory = new Catagories({
                name
            })

            Catagories.findOne({name})
                      .then(category=>{
                        if (category) return res.status(400).json({ msg: 'Category Already exists' })  

                        newCategory
                            .save()
                            .then(category=>{
                                return res.json({
                                    category: {
                                        name: category.name
                                    }
                                })
                            })
                      })
        }
    })

})


router.patch('/:catagoryId',(req,res)=>{
    const id=req.params.id;
    const isAdmin=req.user.isAdmin;

    if(isAdmin) return res.status(422).json({msg: "Unauthorised Request"})

    let validator = new v(req.body, {
        name: 'required|minLength:7'
    });

    validator.check().then(function (matched) {
        if (!matched) {
            res.status(422).json({ msg: validator.errors });
        } else {
            Catagories.findById(id)
            .exec()
            .then(category => {
                if (category) {
                    Catagories.findByIdAndUpdate(id,req.body,{new:true}).then((updatedCategory)=>{
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