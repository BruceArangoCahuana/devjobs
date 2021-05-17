const express = require('express');
const router = express.Router();
const homeControllers = require('../controllers/homeControllers');
const vacanteControllers = require('../controllers/vacanteControllers');
const usuarioControllers = require('../controllers/usuarioControllers');
const authControllers = require('../controllers/authControllers');

module.exports = () =>{
    router.get("/",homeControllers.mostrarTrabajo);
    //crear vacante
    router.get("/vacantes/nueva",
        authControllers.verificarUsuario,
        vacanteControllers.formularioVacantes
    );
    router.post("/vacantes/nueva",
        authControllers.verificarUsuario,
        vacanteControllers.sanitizarVacantes,
        vacanteControllers.agregarVacantes
    );
    //mostrar mas info de vacantes
    router.get("/vacantes/:url",vacanteControllers.mostrarVacantes);
    //editar  vacante
    router.get("/vacantes/editar/:url",
        authControllers.verificarUsuario,
        vacanteControllers.editarVacante
    );
    router.post("/vacantes/editar/:url",
        authControllers.verificarUsuario,
        vacanteControllers.sanitizarVacantes,
        vacanteControllers.guardarEditar
    );
    //Eliminar vacante
    router.delete("/vacantes/eliminar/:id",vacanteControllers.eliminarVacante)
    //crear cuenta
    router.get("/crear-cuenta",usuarioControllers.fromCrearcuenta);
    router.post("/crear-cuenta",
        usuarioControllers.ValidarRegistro,
        usuarioControllers.Crearcuenta
    );
    //autenticar usuario
    router.get("/iniciar-session",usuarioControllers.formIniciarsession);
    router.post("/iniciar-session",authControllers.autenticarUsuario);
    router.get("/cerrar-session",
        authControllers.verificarUsuario,
        authControllers.cerrarSession
    );
    router.get("/restablecer-password",authControllers.formRestablecer);
    router.post("/restablecer-password",authControllers.enviarToken)
    //resetear password y almacenar en la base de dato
    router.get("/restablecer-password/:token",authControllers.guardartoken)
    router.post("/restablecer-password/:token",authControllers.tokenguardado)
    //panel de administracion
    router.get("/panel-administrador",
        authControllers.verificarUsuario,
        authControllers.mostrarPanel
    );
    //editar perfil
    router.get("/editar-perfil",
        authControllers.verificarUsuario,
        usuarioControllers.fromEditarperfil
    )
    router.post("/editar-perfil",
        authControllers.verificarUsuario,
        usuarioControllers.subirImagen,
        usuarioControllers.editarPerfil
    )
    //recibir mensaje de  postulante
    router.post("/vacantes/:url",
        vacanteControllers.subirCV,
        vacanteControllers.contactar
    )
    //muestra los candidatos por vacante
    router.get("/candidatos/:id",
       authControllers.verificarUsuario,
       vacanteControllers.mostrarCandidatos
    )

    //buscador de vacantes
    router.post("/buscador",vacanteControllers.buscadorVacante);
    return router;
}