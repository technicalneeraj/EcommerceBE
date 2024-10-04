const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch((err) => {
            console.error(err);
            next(err);
        });
};

module.exports = { catchAsync };