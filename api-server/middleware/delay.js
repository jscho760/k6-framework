module.exports = function delay(ms) {
    return (req, res, next) => {
        setTimeout(next, ms);
    };
};
