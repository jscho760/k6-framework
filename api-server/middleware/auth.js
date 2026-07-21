module.exports = (req, res, next) => {

    const auth = req.headers.authorization;

    if (!auth) {

        return res.status(401).json({
            result: "FAIL",
            message: "Authorization Header Missing"
        });

    }

    if (!auth.startsWith("Bearer JWT-")) {

        return res.status(401).json({
            result: "FAIL",
            message: "Invalid Token"
        });

    }

    next();

};
