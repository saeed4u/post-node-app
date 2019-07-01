const express = require('express');
const multer = require('multer');
const Post = require('../models/post');

const router = express.Router();

const MIME_TYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file.mimeType);
    const isValid = MIME_TYPE[file.mimetype];
    let error = null;
    if (!isValid) {
      error = new Error("mime type not found");
    }
    cb(error, "backend/images");
  },

  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json({post: post})
    } else {
      res.status(404).json({"message": "Post not found"})
    }
  })
});

router.post("", multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    description: req.body.description,
    imagePath: url + "/images/" + req.file.filename
  });

  console.log(post);
  post.save().then((data) => {
    res.status(201).json({
      message: "Post added successfully", post: {
        ...data,
        id: data._id
      }
    })
  });
});

router.put('/:id', multer({storage: storage}).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    imagePath: imagePath
  });
  Post.updateOne({_id: req.params.id}, post).then((data) => {
    console.log(data);
    res.status(200).json({message: "Update was successful"});
  })
});

router.delete('/:id', (req, res, next) => {
  console.log(req.params.id);
  Post.deleteOne({_id: req.params.id})
    .then((response) => {
      console.log(response);
      res.status(200).json({message: 'Post deleted'})
    });
});

router.get("", (req, res, next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  let fetchedPost;
  console.log(req.query);

  const postQuery = Post.find();
  if(pageSize && currentPage){
    postQuery.skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }
  postQuery.then((documents) => {
    fetchedPost = documents;
    return Post.count();
  }).then((count) => {
    res.status(200).json({
      message: "Success",
      posts: fetchedPost,
      count:count
    });
  }).catch((error)=>{
      console.log(error);
  });
});

module.exports = router;

