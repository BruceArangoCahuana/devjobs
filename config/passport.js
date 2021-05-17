//importamos passport
const passport = require('passport');
//importamos passport-local
const LocalStrategy = require('passport-local').Strategy;
//importamos el modelo
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy(
    {
    usernameField:'email',
    passwordField:'password'
    },
    async (email,password,done)=>{
    //el done de susa como un next(pasar al siguiewnte midelware)
    const usuario = await Usuarios.findOne({email});
    //validamos que revise por el email
        if(!usuario){
            return done(null,false,{
                message:'El usuario no existe'
            });
        }
    //validamos password
    const verificarPass = usuario.compararPassword(password);
        if(!verificarPass){
            return done(null,false,{
                message:'La contraseña es incorrecta'
            });
        }
    // si ya pasamos la validacion
    return done(null,usuario);   
    }
));
passport.serializeUser((usuario,done)=> done(null,usuario._id));

passport.deserializeUser(async(id,done)=>{
    const usuario = await Usuarios.findById(id).exec();
    return done(null,usuario);
});

module.exports = passport;