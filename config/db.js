const mongoose = require('mongoose');
require('dotenv').config({path:'variable.env'});

//nos conectamos a mongodb
mongoose.connect(process.env.DATABASE,{useNewUrlParser:true});
//mostrar error de conection(conexion)
mongoose.connection.on('error',(error)=>{
    console.log(error)
});
//importar modelo
require('../models/vacantes')
require('../models/usuario');