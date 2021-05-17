//importar  instancias requeridas
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajo = async(req,res,next)=>{
    const vacantes = await Vacante.find().lean();
    if(!vacantes)return next();
    res.render('home',{
        nombrePagina:'WorkingPeru',
        tagLine:'Encuentra y publica trabajo para desarrolladores web',
        barra:true,
        boton:true,
        vacantes
    });
   
}