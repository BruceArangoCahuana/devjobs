const passport = require('passport');
//impotamos modelo de vacante
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect:'/panel-administrador',
    failureRedirect:'/iniciar-session',
    failureFlash:true,
    badRequestMessage:'Ambos campos son requeridos'
});
//revisar si esta utenticado o no
exports.verificarUsuario = (req,res,next)=>{
    //revisamos el usuario logeado
    if(req.isAuthenticated()){
        return next();
    }
    //si no a iniciado session
    res.redirect('/iniciar-session');
}
exports.mostrarPanel = async(req,res,next) =>{
    const vacantes = await Vacante.find({autor:req.user._id}).lean();
    res.render('panel',{
        nombrePagina:'Panel-administracion',
        tagLine:'Administra tus publicaciones de vacantes',
        cerrrarSession:true,
        nombre:req.user.nombre,
        imagen:req.user.imagen,
        vacantes
    })
   
}

exports.cerrarSession = (req,res,next)=>{
    req.logout();
    req.flash('correcto','Cerrastes correctamente la session');
    return res.redirect("/");
}
//restablecer contraseña
exports.formRestablecer = (req,res,next)=>{
    res.render("restablecer",{
      nombrePagina:'Restablecer Contraseña',
      tagLine:'Restablece tu contraseña',
    })
  }
//generar token
exports.enviarToken = async(req,res,next) =>{
    const usuarios = await Usuarios.findOne({email:req.body.email});

    if(!usuarios){
        req.flash('error','No existe es cuenta');
        return res.redirect('/iniciar-session');
    }

    //si existe el usuario
    usuarios.token = crypto.randomBytes(20).toString('hex');
    usuarios.expira = Date.now()  + 3600000; 

    //guardamos los datos
    await usuarios.save();

    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuarios.token}`;
    console.log(resetUrl);

    await enviarEmail.enviar({
        usuarios,
        subject:'Restablecer contraseña',
        resetUrl,
        archivo:'reset'
    })
    req.flash('correcto','Revisa tu emil para realizar los cambios');
    res.redirect('/iniciar-session');
}

exports.guardartoken = async(req,res,next)=>{
    const  usuario = await  Usuarios.findOne({
        token: req.params.token,
        expira:{
            $gt:Date.now()
        }

    })
    if(!usuario){
        req.flash('error','Hubo un error');
        return res.redirect('/restablecer-password');
    } 
    res.render('nuevo-password',{
        nombrePagina:'Restablecer Contraseña',
        tagLine:'Coloca tu contraseña nueva',
    })
}

exports.tokenguardado = async(req,res,next) =>{
    const  usuario = await  Usuarios.findOne({
        token: req.params.token,
        expira:{
            $gt:Date.now()
        }

    });

    if(!usuario){
        req.flash('error','Hubo un error');
        return res.redirect('/restablecer-password');
    } 

    //asignamos los nuevo valores
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //guardar en la base d datos

    await  usuario.save();
    //redirigir
    req.flash('correcto','Se modifico correctamente el tu contraseña');
    res.redirect("/iniciar-session");
}