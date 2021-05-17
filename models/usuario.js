const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        trim:true,
        lowercase:true
    },
    nombre:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    token:String,
    expira:Date,
    imagen:String,
}) ;
//metodo para hashear el pasword
usuariosSchema.pre('save',async function(next){
    //validamos si el pasword esta hashado
    if(!this.isModified('password')){
        return next()///continue en el siguiemte midelware
    }
    //si no esta hssheado
    const hash = await bcrypt.hash(this.password,12);
    this.password=hash;
    next();
})
//mostrando error de correo ya creado
usuariosSchema.post('save',function(error,doc,next){
    if(error.name === 'MongoError'&& error.code === 11000){
        next('Este correo esta registrado')
    }else{
        next(error)
    }
});
//autenticar usurio
usuariosSchema.methods = {
    compararPassword:function(password){
        return bcrypt.compareSync(password,this.password); 
    }
}
module.exports = mongoose.model('Usuarios',usuariosSchema);