const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");
const v = require("node-input-validator");

const checkAuth = require("../middleware/auth");

const User = require("../models/user");

// Signup API
router.post("/signup", (req, res) => {
  const { name, email, password, isVendor, isAdmin } = req.body;

  // Validation
  let validator = new v(req.body, {
    email: "required|email",
    password: "required"
  });

  validator.check().then(function(matched) {
    if (!matched) {
      res.status(422).json({ msg: validator.errors });
    } else {
      const newUser = new User({
        name,
        email,
        password,
        isVendor,
        isAdmin
      });

      User.findOne({ email })
        .then(user => {
          if (user) return res.status(400).json({ msg: "User Already exists" });

          // Create salt and hash
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser.save().then(user => {
                jwt.sign(
                  {
                    id: user.id,
                    isAdmin: user.isAdmin,
                    isVendor: user.isVendor
                  },
                  config.get("jwtSecret"),
                  { expiresIn: 3600 },
                  (err, token) => {
                    if (err) throw err;
                    res.json({
                      token,
                      user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        isVendor: user.isVendor,
                        isAdmin: user.isAdmin
                      }
                    });
                  }
                );
              });
            });
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    }
  });
});

// Login API
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validation
  let validator = new v(req.body, {
    email: "required|email",
    password: "required"
  });

  validator.check().then(function(matched) {
    if (!matched) {
      res.status(422).json({ msg: validator.errors });
    }
  });

  User.findOne({ email })
    .then(user => {
      if (!user) res.status(400).json({ msg: "User does not exist" });

      bcrypt.compare(password, user.password).then(isMatch => {
        if (!isMatch) res.status(400).json({ msg: "Invalid credentials" });

        jwt.sign(
          { id: user.id, isAdmin: user.isAdmin, isVendor: user.isVendor },
          config.get("jwtSecret"),
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isVendor: user.isVendor,
                isAdmin: user.isAdmin
              }
            });
          }
        );
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

//Api for deleting the user , can be accessed by only logged in user who can only delete self account and the admin who can delete any account

router.delete("/:Id", checkAuth, (req, res) => {
  const id = req.params.Id;
  const { Id, isAdmin } = req.user;
  if (id === Id || isAdmin) {
    User.remove({ _id: id }, err => {
      if (!err) {
        return res.status(200).json({
          message: "Successfully Removed"
        });
      } else {
        res.status(500).json({
          error: err
        });
      }
    });
  } else {
    res.status(500).json({
      message: "Unauthorized Access"
    });
  }
});

//Api for getting list of all vendors (Access: admin )
router.get("/vendors", checkAuth, (req, res, next) => {
  User.find({ isVendor: true })
    .exec()
    .then(users => {
      if (req.user.isAdmin) {
        if (users) {
          res.status(200).json({
            users: users
          });
        } else {
          res.status(404).json({
            message: "no entry found"
          });
        }
      } else {
        res.status(401).json({
          message: "Unautherized access"
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

//Api for getting all users (Access: admin)
router.get("/", checkAuth, (req, res, next) => {
  User.find()
    .exec()
    .then(users => {
      if (req.user.isAdmin) {
        if (users) {
          res.status(200).json({
            users: users
          });
        } else {
          res.status(404).json({
            message: "no entry found"
          });
        }
      } else {
        res.status(401).json({
          message: "Unautherized access"
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

// Get user details by ID
router.get("/:Id", checkAuth /* Calling middleware for auth */, (req, res) => {
  // If Id== vendor Id --> accessible to all
  const id = req.params.Id;
  User.findById(id)
    .exec()
    .then(user => {
      //console.log(user);
      if (user) {
        if (user.isVendor == 1 || user.id == req.user.id) {
          res.status(200).json({
            user: user
          });
        } else {
          res.status(422).json({
            msg: "Unauthorised Request"
          });
        }
      } else {
        res.status(404).json({
          message: "No entry found for given ID"
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

// Update user details by ID
router.patch(
  "/:Id",
  checkAuth /* Calling middleware for auth */,
  (req, res) => {
    const id = req.params.Id;
    const { name, email, password, isVendor, isAdmin } = req.body;

    const obj = {};
    if (name) {
      obj.name = "required|minLength:5";
    }
    if (email) {
      obj.email = "required|email";
    }
    if (password) {
      obj.password = "required";
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(password, salt);
      req.body.password = hash;
    }

    // Validation
    let validator = new v(req.body, obj);

    validator.check().then(function(matched) {
      if (!matched) {
        res.status(422).json({ msg: validator.errors });
      } else {
        User.findById(id)
          .exec()
          .then(user => {
            if (user) {
              User.findByIdAndUpdate(id, req.body, { new: true }).then(
                updatedUser => {
                  const updated = {};
                  updated.id = updatedUser._id;
                  updated.isVendor = updatedUser.isVendor;
                  updated.isAdmin = updatedUser.isAdmin;
                  updated.name = updatedUser.name;
                  updated.email = updatedUser.email;
                  res.status(200).json(updated);
                }
              );
            } else {
              res.status(404).json({
                message: "No entry found for given ID"
              });
            }
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
          });
      }
    });
  }
);

//API for changing the password(Vendor)

router.patch(
  "/password/:Id",
  checkAuth /* Calling middleware for auth */,
  (req, res) => {
    const id = req.params.Id;
    let { newPassword, oldPassword } = req.body;
    console.log(newPassword);
    let obj = {};
    if (newPassword) {
      obj.newPassword = "required";
    }

    // Validation
    let validator = new v(req.body, obj);

    validator.check().then(function(matched) {
      if (!matched) {
        return res.status(422).json({ msg: validator.errors });
      }
      User.findById(id)
        .exec()
        .then(user => {
          if (user) {
            console.log(user.password, oldPassword);
            if (bcrypt.compareSync(oldPassword, user.password)) {
                console.log("dsdsddsd");
              var salt = bcrypt.genSaltSync(10);
              var hash = bcrypt.hashSync(newPassword, salt);
              User.findByIdAndUpdate(id, { password: hash }, { new: true })
                .then(updated => {
                    console.log("Then runs");
                  return res.status(200).json({
                    updatedUser: updated
                  });
                })
                .catch(err => {
                    console.log("error runs");
                  return res.status(422).json({err:err});
                });
            }
            else{
            return res.status(422).json({
              msg: "Old Password incorrect"
            });
        }
          }
          else{
          return res.status(400).json({
            msg: "No entry found"
          });
        }
        })
        .catch(err => {
          return res.status(500).json({err:err});
        });
    });
  }
);

// Add other APIs as mentioned in the API schema

module.exports = router;
