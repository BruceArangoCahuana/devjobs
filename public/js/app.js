import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded',()=>{
    const skill = document.querySelector(".lista-conocimientos");

    //limpiar alertas de error
    let alertas = document.querySelector('.alertas');
    if(alertas){
        limpiarAlertas();
    }
    if(skill){
        document.addEventListener('click',agregarSkill);
        //una vez estemos editando llamamos a la funcion
        skillSeleccionadas();
    }
    const vacanteListado = document.querySelector(".panel-administracion");
    if(vacanteListado){
        vacanteListado.addEventListener('click',accionesListado);
    }
});
//para poder insertar o eliminar datos de un arreglo de manera sencilla
const skills = new Set();
const agregarSkill =(e)=>{
    if(e.target.tagName==='LI'){
       if(e.target.classList.contains('activo')){
            //quitar el activo y del arreglo
            skills.delete(e.target.textContent);
            e.target.classList.remove("activo");
       }else{
            skills.add(e.target.textContent);
            e.target.classList.add("activo");
       }
    }
    const skillsArray = [...skills];
    document.querySelector('#skills').value=skillsArray;
}
const skillSeleccionadas = ()=>{
    const selecionadas = Array.from(document.querySelectorAll(".lista-conocimientos .activo"));
    selecionadas.forEach(selecionada => {
        skills.add(selecionada.textContent);
    });
    //lo inyectamos en el hidden del skill
    const skillsArray = [...skills];
    document.querySelector('#skills').value=skillsArray;
    console.log(selecionadas);    
}
const limpiarAlertas = () =>{
    const alertas = document.querySelector('.alertas');
    //validamos si exites las alertas
   const interval = setInterval(() => {
    if(alertas.children.length > 0){
        alertas.removeChild(alertas.children[0]);
    }else if(alertas.children.length === 0){
        alertas.parentElement.removeChild(alertas);
        clearInterval(interval);
    }
   }, 2000);
}
//eliminar vacantes
const accionesListado = (e) =>{
    e.preventDefault()

     if(e.target.dataset.eliminar){
        Swal.fire({
            title: '¿Confirma borrar vacante o publicacion?',
            text: "Una vez eliminada ,no se podra recupearar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si eliminar!',
            cancelButtonText: 'No eliminar!'
          }).then((result) => {
            if (result.isConfirmed) {
              //url para la peticion
              const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
             //eliminamos con axios
             axios.delete(url,{params:{url}}).
             then(function(respuesta){
                    if(respuesta.status === 200){
                        Swal.fire(
                            'Se elimino!',
                            respuesta.data,
                            'success'
                          )
                          //eliminamos del DOM
                          e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
                    }
             }).catch(()=>{
                Swal.fire({
                    type:'error',
                    title:'Hubo un error',
                    text:'No se pudo eliminar'
                })
                window.location.replace(`${location.origin}/panel-administrador`);
             })
            }
          })
    }else if(e.target.tagName === 'A'){
        window.location.href = e.target.href;
    }
}