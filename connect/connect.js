  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO)
  .then(()=>{
    console.log('mongoose connected succesfully');
  }).catch((e)=>{
    console.log(e);
  })