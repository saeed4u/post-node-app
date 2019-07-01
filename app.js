const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const postRoutes = require('./routes/posts');

mongoose.connect('mongodb+srv://brasaeed:RlbskhnZkPeEafS5@cluster0-w4x6o.mongodb.net/node-angular?retryWrites=true')
  .then((item) => {
    console.log("Connected to db!");
    console.log(item);
  }).catch((error) => {
  console.log(error);
});

app.use(bodyParser.json());

app.use("/images",express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type,Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,PUT,OPTIONS');
  next();
});

app.use("/api/posts",postRoutes);



module.exports = app;
