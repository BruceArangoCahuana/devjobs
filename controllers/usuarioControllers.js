//importar  instancias requeridas
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortId = require('shortid');

exports.subirImagen = (req,res,next)=>{
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
      res.redirect('/panel-administrador');
      return;//para prevenir que se ejecute todo el codigo
    }else{
      return next();
    }
  });

}
//opciones de multer
const configuracionMulter ={
  limits:{fileSize:100000},
  storage:fileStorage = multer.diskStorage({
    destination : (req,file,cb) =>{
      cb(null,__dirname+'../../public/uploads/perfil');
    },
    filename:(req,file,cb)=>{
      const extension =  file.mimetype.split('/')[1];
      cb(null,`${shortId.generate()}.${extension}`);
    }
  }),
  fileFilter(req,file,cb){
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ){
      cb(null,true);
    }else{
      cb(new Error('Formato no valido'));
    }
  }
  
}
const upload = multer(configuracionMulter).single('imagen');

exports.fromCrearcuenta = (req,res)=>{
    res.render('crear-cuenta',{
        nombrePagina:'Crear curenta WorkingPeru',
        tagLine:'Publica tus vacantes de froma gratuita,crea tu cuenta AHORA',
        barra:true
    })
}



exports.ValidarRegistro = (req,res,next)=>{
    //sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();
    
    req.checkBody('nombre','El nombre es obligatorio').notEmpty();
    req.checkBody('email','El email debe ser valido').isEmail();
    req.checkBody('password','El password es obligatorio').notEmpty();
    req.checkBody('confirmar','El password es obligatorio').notEmpty();
    req.checkBody('confirmar','El password es diferente').equals(req.body.password);

    const errores = req.validationErrors();
    if(errores){
      //si hay errores
      req.flash('error',errores.map(error=>error.msg));
      
      res.render('crear-cuenta',{
        nombrePagina:'Crear curenta WorkingPeru',
        tagLine:'Publica tus vacantes de froma gratuita,crea tu cuenta AHORA',
        barra:true,
        mensajes:req.flash()
      });
      
      return;
    }
    //sino hay errores pasa al siguiente midelware
    next();
}

exports.Crearcuenta = async (req,res,next) =>{
    const usuario =  new Usuarios(req.body);
    

    try {
      await usuario.save();
      res.redirect('/inicia-session');
    } catch (error) {
      req.flash('error',error)
      res.redirect("/crear-cuenta");
    }
     
}

exports.formIniciarsession = (req,res,next) => {
  res.render('iniciar-session',{
        nombrePagina:'Iniciar session WorkingPeru',
        tagLine:'Inicia session y publica tus vacantes',
        barra:true
  })
}
exports.fromEditarperfil = (req,res,next) =>{
 res.render('editar-perfil',{
    nombrePagina:'Editar Perfil',
    tagLine:'Edita tu perfil aqui..!',
    cerrrarSession:true,
    nombre:req.user.nombre,
    imagen:req.user.imagen,
    usuario:req.user.toObject()
    })
 
}
exports.editarPerfil = async (req,res,next) =>{
  const usuario = await Usuarios.findById(req.user._id);
  usuario.nombre = req.body.nombre;
  usuario.email = req.body.email;
  if(req.body.password){
    usuario.password = req.body.password;
  }
  if(req.file){
    usuario.imagen = req.file.filename;
  }
  await usuario.save();
  req.flash('correcto','Se guardo los cambios correctamente')
  //lo redirigimos al panel
  res.redirect('/panel-administrador');
  
}
//restaurar usuario


