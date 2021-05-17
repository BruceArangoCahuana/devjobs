//impoirtando mongoose
const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
//handlebars
const exphbs = require('express-handlebars');

//importar path
const path = require('path');
//importar la ruta
const router = require("./routes");
//importamos cookies-parse
const cookiesParser = require('cookie-parser');
//importamos express-session
const session = require('express-session');
//importando mongooseStore
const MongoStore = require('connect-mongo')(session);
//bodyparse
const bodyParser = require('body-parser')
//express validator
const expressValidator = require('express-validator');
//flash
const flash = require('connect-flash');
//importamos liberia error
const  createError = require('http-errors');
//importamos passport
const passport = require('./config/passport');

//importando variables de enorno
require('dotenv').config({path:'variable.env'});
//importar express
const app = express();
//habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//validacion con express validator
app.use(expressValidator());


//habilitar handlebars
app.engine("handlebars",exphbs({
    defaultLayout: 'layout',
    helpers:require('./helpers/handlebars')
    })
);
app.set('view engine','handlebars');
//archivos staticos
app.use(express.static(path.join(__dirname,'public')));
//habilitando la session
app.use(cookiesParser());
app.use(session({
   secret:process.env.SECRETO,
   key:process.env.KEY,
   resave:false,
   saveUninitialized:false,
   store: new MongoStore({mongooseConnection:mongoose.connection})
}));
//iniciañozar passport
app.use(passport.initialize());
app.use(passport.session());
//alertas y mensaje con flash
app.use(flash());
//creamos los midelware
app.use((req,res,next)=>{
    res.locals.mensajes = req.flash();
    next();
});

app.use('/',router());
//error 404 pagina no existente
app.use((req,res,next)=>{
    next(createError(404,'Pagina no encontrada'))
});
//administracionn de los errores
app.use((error,req,res,next)=>{
    res.locals.mensaje=error.message; 
    const status  = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

//dejar que heroku asigne el puerto
const host  = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 80;

app.listen(port,host,()=>{
    console.log("El servidor esta funcionando ahora")
});