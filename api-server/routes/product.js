const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const delay = require("../middleware/delay");
const randomError = require("../middleware/error");

router.use(auth);

// 모든 Product API에 적용
router.use(delay(150));
router.use(randomError(0.05));

router.get("/", (req, res) => {

    res.json([
        { id: 1, name: "Laptop", price: 1500 },
        { id: 2, name: "Monitor", price: 500 }
    ]);

});

module.exports = router;