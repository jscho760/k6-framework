const express = require("express");

const app = express();

app.use(express.json());

app.use("/login", require("./routes/login"));

app.use("/products", require("./routes/product"));

app.listen(8080, () => {

    console.log("Performance Lab API Started");

});d