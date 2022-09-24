const router = require("express").Router();
const Post = require("../Models/Post");
const { verifyToken } = require("./VerifyToken");

router.post("user/post", verifyToken, async (req, res) => {
  try {
    let { title, image, video } = req.body;
    let newPost = new Post({
      title,
      image,
      video,
      user: req.user.id,
    });
    const post = await newPost.save();
    res.status(200).json(newPost);
  } catch (e) {
    res.status(500).json("Internal error occurred");
  }
});

//upload post by one user
router.get("/get/post", verifyToken, async (req, res) => {
  // try {
  const myPost = await Post.findById({ user: req.user.id });
  if (!myPost) {
    return res.status(400).json("You don't have any post");
  }
  res.status(200).json(myPost);
  // } catch (e) {
  //   res.status(500).json("Internal server occurred");
  // }
});

//update user post
router.put("/update/post/:id", verifyToken, async (req, res) => {
  // try {
  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(400).json("Post does not found");
  }
  post = await Post.findByIdAndUpdate(req.params.id, { $set: req.body });
  let updatePost = await post.save();
  res.status(200).json(updatePost);
  // } catch (e) {
  //   return res.status(500).json("Internal error occurred");
  // }
});

//Like
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.like.includes(req.body.user)) {
      if (post.dislike.includes(req.body.user)) {
        await post.updateOne({ pull: { dislike: req.body.user } });
      }
      await post.updateOne({ $push: { like: req.body.user } });
      return res.status(200).json("Post has been liked");
    } else {
      await post.updateOne({ $pull: { like: req.body.user } });
      return res.status(200).json("Post has been unlike");
    }
  } catch (e) {
    return res.status(500).json("Internal server error");
  }
});

//Dislike
router.put("/:id/dislike", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.dislike.includes(req.body.user)) {
      if (post.dislike.includes(req.body.user)) {
        await post.updateOne({ pull: { like: req.body.user } });
      }
      await post.updateOne({ $push: { dislike: req.body.user } });
      return res.status(200).json("Post has been disliked");
    } else {
      await post.updateOne({ $pull: { dislike: req.body.user } });
      return res.status(200).json("Post has been unlike");
    }
  } catch (e) {
    return res.status(500).json("Internal server error");
  }
});

//Comment
router.put("/comment/post", verifyToken, async (req, res) => {
  try {
    const { comment, postId } = req.body;
    const comments = {
      user: req.user.id,
      username: req.user.username,
      comment,
    };
    const post = await Post.findById(postId);
    post.comment.push(comments);
    await post.save();
    res.status(200).json(post);
  } catch (e) {
    return res.status(500).json("Internal server error");
  }
});

//Delete post
router.delete("/delete/post/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user === req.user.id) {
      const deletePost = await Post.findByIdAndDelete(req.params.id);
      return res.status(200).json("Your post has been deleted");
    } else {
      return res.status(400).json("You are not allow to delete this post");
    }
  } catch (e) {
    return res.status(500).json("Internal server error");
  }
});
module.exports = router;
