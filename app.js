const cors = require('cors')
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

app.use('/api/places', productRoutes);
app.use('/api/user', usersRoutes);
app.use('/api/orders', orderRoutes);

app.use(express.static('public'));

app.use((req, res, next) => {
  const error = new HttpError('Page you requested is invalid', 404);
  throw error;
});

mongoose
  .connect(keys.mongoURI)
  .then(() => {
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });
