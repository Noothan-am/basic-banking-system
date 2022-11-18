require('dotenv').config();
// var dotenv = require('dotenv');
const express = require('express');
const userdata = require('./model/TransactionModel')
const newuser = require('./model/customerdata');
const moment = require('moment');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const path = require('path');
const hbs = require('hbs');
require('./connect/connect')

port = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

partialsPath = path.join(__dirname, "./partials")

app.set("view engine", "hbs");
hbs.registerPartials(partialsPath);


// ALL GET REQUEST ROUTES 

// 1. GET REQUIST FOR HOME PAGE 
app.get('/', (req, res) => {
    res.render("index");
})

// 2. THIS GET ROUTER GETS THE ADD NEW USER PAGE 
app.get('/adduser', (req, res) => {
    res.render('adduser')
})

// 3. THIS GET ROUTER GETS THE LIST OF ALL CUSTOMERS PAGE 
app.get("/customer", async (req, res) => {
    const allusers = await newuser.find({}).sort({ $natural: -1 })
    res.render("customer", {
        users: allusers
    });
})

// 4. THIS GET ROUTER GETS THE UPDATEUSER PAGE 
app.get('/updateuser', (req, res) => {
    res.render('updateuser');
})

// 5. THIS GET ROUTER GETS THE TRANSFER PAGE 
app.get('/transfer', (req, res) => {
    res.render('transfer');
})

// 6. THIS GET ROUTER GETS THE 10 RECENT TRANSACTION HISTORY PAGE 
app.get("/history", async (req, res) => {
    let newuserdata = await userdata.find({}).limit(10).sort({ $natural: -1 });
    res.render("history", {
        newuserdata: newuserdata
    });
})

// 7. THIS GET ROUTER GETS THE LIST OF ALL TRANSACTION HISTORY PAGE 
app.get('/full', async (req, res) => {
    let newuserdata = await userdata.find({}).sort({ $natural: -1 });
    res.render("history", {
        newuserdata: newuserdata
    });
})





// ALL POST REQUEST ROUTES


// 1. POST REQUEST FOR ADDING NEW CUSTOMERS IN DATABASE
app.post('/customer',
[body('email','please enter a valid email').isEmail(),
body('name','please enter a valid name').isLength({min:3}), 
body('accno','please enter a valid accno').isLength({min:10,max:10}),
body('password','please enter a valid password').isLength({ min: 5})],
  
async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        } else {
            const password = await bcrypt.hash(req.body.password, 8);
            const newcustomer = new newuser({
                name: req.body.name,
                email: req.body.email,
                accno: req.body.accno,
                balance: req.body.balance,
                password: password
            })
            newcustomer.save();
            res.redirect('adduser')
        }
    } catch (error) {
        console.log(error);
    }
})

// 2. POST REQUEST FOR UPDATING THE USER BALANCE IN DATABASE
app.post('/updateuser',async (req,res)=>{
    try {
        const currentaccno= req.body.currentaccno;
        const password= req.body.password;
        const addamt =req.body.addamount;
        
        const updateuser = await newuser.findOne({ accno: currentaccno });
        if(updateuser){
            bcrypt.compare(password,updateuser.password, async (err,result)=>{
                if (result) {
                    await newuser.updateOne({ accno: currentaccno }, {
                        $set: {
                            balance:addamt
                            }
                    })
                    res.redirect('updateuser')
                } else {
                    console.log('invalid login credentials');
                }
            })
        }else{
            alert('invalid user details');
        }
    } catch (error) {
        console.log(error);
    }
})

// 3. POST REQUEST FOR SAVING THE TRANSACION HISTORY AND NET BALANCE IN THE MONGO DB DATABASE
app.post("/transfer", async (req, res) => {
    try {
        const from = req.body.from
        const transferamt = req.body.amount
        const userexists = await newuser.findOne({ accno: from })
        const balance = userexists.balance - transferamt;
        const result = await bcrypt.compare(req.body.password, userexists.password);
        if (result) {
            if (userexists) {
                if (balance >= 0) {
                    const transfer = new userdata({
                        from: from,
                        to: req.body.to,
                        amount: transferamt,
                        date: moment().format('MMMM, Do YYYY, h:mm:ss a')
                    })

                    await newuser.updateOne({ accno: from }, {
                        $set: {
                            balance: balance
                        }
                    })
                    transfer.save();
                    res.render('transfer');
                } else {
                    res.send();
                }
            } else {
                console.log('user not found');
            }
        } else {
            res.send('please add valid credentials')
        }
        
    }
    catch (error) {
        res.send('internal server error')
    }
})




app.listen(port, () => {
    console.log(`listening to ${port} and connection succesfull`);
});

  