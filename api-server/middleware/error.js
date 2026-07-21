module.exports = function error(rate = 0.05) {

    return (req, res, next) => {

        if (Math.random() < rate) {

            return res.status(500).json({
                result: "FAIL",
                message: "Internal Server Error"
            });

        }

        next();

    };

};
