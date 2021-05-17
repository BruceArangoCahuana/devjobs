//importar  instancias requeridas
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortId = require('shortid');

exports.formularioVacantes = (req,res)=>{
    res.render("nueva-vacante",{
        nombrePagina:'Nueva vacante',
        tagLine:'Llena el formulario y publica una nueva vacante',
        cerrrarSession:true,
        nombre:req.user.nombre,
        imagen:req.user.imagen 
    })
}
//guardando la vacantes a la base de datos
exports.agregarVacantes = async(req,res)=>{
   const vacante = new Vacante(req.body);
   //crear arreglo de habilidades(skills)
   vacante.autor = req.user._id;
   vacante.skills= req.body.skills.split(',');

  // almacenar en la base de datos
  const nuevaVacante =  await  vacante.save();
  //redireccionar
  res.redirect(`/vacantes/${nuevaVacante.url}`)
}
//mostrar mas info de vaacntes
exports.mostrarVacantes = async (req,res,next)=>{
    const vacantes = await Vacante.findOne({url:req.params.url}).populate('autor').lean();
    //si no hay resultado siguiente midelware
    if(!vacantes) return next();
    //pasamos los datos a la vista
    res.render('vacante',{
        nombrePagina:'Descripcion de la Vacante',
        tagLine:"Puedes ver la informacion completa sobre la vacante",
        barra:true,
        vacantes
    });
}
//editar la vacante
exports.editarVacante  = async (req,res,next)=>{
    const vacantes = await Vacante.findOne({url:req.params.url}).lean();
    //si no hay resultado siguiente midelware
    if(!vacantes) return next();
    //pasamos los datos a ala vista
    res.render('editar-vacante',{
        nombrePagina:`Editar vacante-${vacantes.titulo}`,
        cerrrarSession:true,
        nombre:req.user.nombre,
        imagen:req.user.imagen,
        vacantes
    })

}
//guardar cambio
exports.guardarEditar = async (req,res)=>{
    const editarvacante = req.body;
    editarvacante.skills = req.body.skills.split(',');
    //actulizar
    const vacantes = await Vacante.findOneAndUpdate({url: req.params.url},editarvacante,{
         new:true,
         runValidators:true
    });
    res.redirect(`/vacantes/${vacantes.url}`);
}
//Validar y sanitizar nuevas vacantes
exports.sanitizarVacantes = (req,res,next)=>{
    //sanitizar campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();
    //validar
    req.checkBody('titulo','Es necesario agregar la vacante').notEmpty();
    req.checkBody('empresa','Es necesario agregar la empresa').notEmpty();
    req.checkBody('ubicacion','Es necesario agregar la ubicacion').notEmpty();
    req.checkBody('contrato','Es necesario seleccionar el contrato').notEmpty();
    req.checkBody('skills','Es necesario seleccionar los conocimientos').notEmpty();

    const errores = req.validationErrors();
    if(errores){
        //recaragamos la vista si hay errores
        req.flash('error',errores.map(error => error.msg));

        res.render("nueva-vacante",{
            nombrePagina:'Nueva vacante',
            tagLine:'Llena el formulario y publica una nueva vacante',
            cerrrarSession:true,
            nombre:req.user.nombre,
            mensajes:req.flash()
        })
    }
    next();
}
exports.eliminarVacante = async (req,res,next) => {
    const {id} = req.params;
    const vacante = await Vacante.findById(id)
    //verificamos que el que eliminara es el mismo que se logeo
    if(varificarAutor(vacante,req.user)){
        //si es el usuario
        vacante.remove();
        res.status(200).send("Vacante eliminada correctamente");
        res.redirect('back');
    }else{
        //no permitido
        res.status(403).send("Error de autenticacion");
    }
   
}
const  varificarAutor = (vacante={},usuario={}) =>{
    //revisamos si el que se leo es el mismo de la base de datos
    if(!vacante.autor.equals(usuario._id)){
        return false;
    }
    return true;
    
}

exports.subirCV =  (req,res,next)=>{
    upload(req,res,function(error){
      if(error){
        if(error instanceof multer.MulterError){
          if(error.code === 'LIMIT_FILE_SIZE'){
              req.flash('error','El archivo es muy grande,maximo 100kb')
          }else{
            req.flash('error',error.message);
          }
        }else{
          req.flash('error',error.message);
        }
        res.redirect('back');
        return;//para prevenir que se ejecute todo el codigo
      }else{
        return next();
      }
    });
  
  }
//opciones de multer
const configuracionMulter ={
  limits:{fileSize:500000},
  storage:fileStorage = multer.diskStorage({
    destination : (req,file,cb) =>{
      cb(null,__dirname+'../../public/uploads/cv');
    },
    filename:(req,file,cb)=>{
      const extension =  file.mimetype.split('/')[1];
      cb(null,`${shortId.generate()}.${extension}`);
    }
  }),
  fileFilter(req,file,cb){
    if(file.mimetype === 'application/pdf'){
      cb(null,true);
    }else{
      cb(new Error('Formato no valido'));
    }
  }
  
}
  const upload = multer(configuracionMulter).single('cv');
//almacenar los candidatos en la base de datos
exports.contactar = async(req,res,next) =>{
const vacante = await Vacante.findOne({url:req.params.url});
//validamos que exita la url

if(!vacante) return next();

const nuevaVacante = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename
 }
 vacante.candidatos.push(nuevaVacante);
 await vacante.save();

 //mensaje de verficacion y redireccion
req.flash('correcto','Se envio correctamente tu CV');
res.redirect('/');
}

//mostrar candidato

exports.mostrarCandidatos = async (req,res,next)=>{
  const vacantes = await Vacante.findById(req.params.id).lean();

  if(vacantes.autor != req.user._id.toString()){
    return next();
  }
  if(!vacantes) return next();

  res.render('candidato',{
    nombrePagina:`Candidato Vacante -  ${vacantes.titulo}`,
    tagLine:"Revisa la informacion del candidato",
    cerrrarSession:true,
    nombre:req.user.nombre,
    imagen:req.user.imagen,
    candidatos:vacantes.candidatos
   });
}

exports.buscadorVacante = async (req,res,next)=>{
const vacantes = await Vacante.find({
    $text:{
      $search: req.body.q
    }
  }).lean();
  //mostrar la vacantes
  res.render('home',{
    nombrePagina:`Resultado de la busqueda -  ${req.body.q}`,
    barra:true,
    vacantes
  })
}