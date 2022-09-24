const router = require("express").Router();
const User = require("../Models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sign } = require("jsonwebtoken");
const { verifyToken } = require("./VerifyToken");
const Post = require("../Models/Post");
const { compileETag } = require("express/lib/utils");
const { json } = require("express");
const JWTSEC = "&JDhh37akg!kh#e";

router.post(
  "/create/user",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("username").isLength({ min: 5 }),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json("some error occurred");
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(200).json("Please login with correct password");
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: secPass,
        profile: req.body.profile,
      });

      const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        JWTSEC
      );

      await user.save();
      res.status(200).json({ user, accessToken });
    } catch (error) {
      return res.status(400).json("Internal error occurred");
    }
  }
);

//Login
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("username").isLength({ min: 5 }),
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json("some error occurred");
    }
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).json("User doesn't found");
      }
      const comparePassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!comparePassword) {
        return res.status(400).json("Password error");
      }
      const accessToken = jwt.sign(
        {
          id: user._id,
          username: user.username,
        },
        JWTSEC
      );
      const { password, ...other } = user._doc;
      res.status(200).json({ user, accessToken });
    } catch (e) {
      res.status(500).json("Internal error occurred");
    }
  }
);

//Following
router.put("/following/:id", verifyToken, async (req, res) => {
  if (req.params.id !== req.body.user) {
    const user = await User.findById(req.params.id);
    const otherUser = await User.findById(req.body.user);

    if (!user.followers.includes(req.body.user)) {
      await user.updateOne({ $push: { followers: req.body.user } });
      await otherUser.updateOne({ $push: { following: req.params.id } });
      return res.status(200).json("User has followed");
    } else {
      return res.status(400).json("You already follow this user");
    }
  } else {
    return res.status(400).json("You can't follow yourself");
  }
});

//Fetch post from followers
router.get("/flw/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const followersPost = await Promise.all(
      user.following.map((item) => Post.find({ user: item }))
    );
    res.status(200).json(followersPost);
  } catch (e) {
    return res.status(500).json("Internal server occurred");
  }
});

//Update user profile
router.put("update/:id", verifyToken, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      if (req.body.password) {
        const salt = bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password, salt);
        req.body.password = secpass;
        const updateuser = await User.findByIdAndUpdate(req.params.id, {
          $set: req.body,
        });
        await updateuser.save();
        res.status(200).json(updateuser);
      }
    } else {
      return res
        .status(400)
        .json("You are not allow to update this user details");
    }
  } catch (e) {
    res.status(500).json("Internal server error");
  }
});

//Delete user account
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(400).json("Account doesn't match");
    } else {
      await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("User account has been delete");
    }
  } catch (e) {
    return res.status(400).json("Internal server error");
  }
});
module.exports = router;
