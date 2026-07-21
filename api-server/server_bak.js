const express = require("express");

const app = express();

app.use(express.json());

/******************************************
 * Login
 ******************************************/
app.post("/login", (req, res) => {

    const token = "JWT-" + Math.random().toString(36).substring(2);

    res.json({
        result: "SUCCESS",
        token,
        userId: req.body.userId
    });

});

/******************************************
 * Product List
 ******************************************/
app.get("/products", (req, res) => {

    const auth = req.headers.authorization;

    if (!auth) {
        return res.status(401).json({
            result: "FAIL",
            message: "Unauthorized"
        });
    }

    res.json([
        {
            id:1,
            name:"Laptop",
            price:1500
        },
        {
            id:2,
            name:"Monitor",
            price:400
        },
        {
            id:3,
            name:"Keyboard",
            price:80
        }
    ]);

});

/******************************************
 * Product Detail
 ******************************************/
app.get("/products/:id",(req,res)=>{

    const id=req.params.id;

    res.json({

        id:id,

        name:"Product-"+id,

        stock:100,

        price:1000

    });

});

/******************************************
 * Cart
 ******************************************/
app.post("/cart",(req,res)=>{

    res.json({

        result:"SUCCESS",

        cartId:"CART-"+Date.now()

    });

});

/******************************************
 * Order
 ******************************************/
app.post("/order",(req,res)=>{

    res.json({

        result:"SUCCESS",

        orderNo:"ORDER-"+Date.now()

    });

});

app.listen(8080,()=>{

    console.log("Performance Lab API Started");

});