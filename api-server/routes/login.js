const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {

    const token = "JWT-" + Math.random().toString(36).substring(2);

    res.json({
        result: "SUCCESS",
        token,
        userId: req.body.userId
    });

});

module.exports = router;
