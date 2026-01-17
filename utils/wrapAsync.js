module.exports = function wrapAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(err => {
      if (res.headersSent) {
        // ⛔ Response already sent, DO NOT forward error
        return;
      }
      next(err);
    });
  };
};
