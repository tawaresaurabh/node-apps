const mongoose = require('mongoose');

/**
 * Open connection to Mongodb for CRUD operations
 * 
 * @throws { Error } if unsuccessfull
 * @returns { void }
 * 
 */
function connectDB (dbURL) {
  // Do nothing if already connected
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
      })
      .then(() => {
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

/**
 * Closes connection to Mongodb
 * 
 * @param { Error} err - Mongodn connection error object
 * @throws { Error } 
 * @returns { void }
 * 
 */
function handleCriticalError (err) {
  console.error(err);
  throw err;
}

/**
 * Throws error on catch when connecting to Mongodb
 * 
 * @throws { Error } if unsuccessfull
 * @returns { void }
 * 
 */
function disconnectDB () {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB};
