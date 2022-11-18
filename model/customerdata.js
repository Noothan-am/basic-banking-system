const mongoose = require('mongoose');

const customerschema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique : true
    },
    balance:{
        type:Number,
        required:true,
    },
    accno:{
        type:Number,
        required:true,
        unique : true
    },
    password:{
        type:String,
        required:true,
    }
})

const newuser = mongoose.model('newuser',customerschema);

module.exports=newuser;