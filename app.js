const path = require('path')
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const busboy = require('connect-busboy');

const productRoutes = require('./routes/products-routes');
const orderRoutes = require('./routes/orders-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();
const PORT = 5000;

app.use(busboy());
app.use(cors())



app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/products', productRoutes);
app.use('/api/user', usersRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res, next) => {
  return res.status(404).json('This route is invalid');
});

mongoose
  .connect(keys.mongoURI)
  .then(() => {
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });
