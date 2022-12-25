const mongoose = require('mongoose');
 
const schema = new mongoose.Schema({
    from:{
        type:Number,
        required:true,
    },
    to:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    date:{
        type:String,
        required:true,
    }
})

const userdata = mongoose.model('userdata',schema);

module.exports=userdata;
