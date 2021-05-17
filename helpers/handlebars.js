module.exports = {
    seleccionarSkill:(seleccionada = [],opciones)=>{
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];
        let html = "";
        skills.forEach(skill => {
            html +=`
                <li ${seleccionada.includes(skill)?' class="activo"':''}>${skill}</li>
            `;
        });
        return opciones.fn().html = html;
    },
    tipoContrato:(selecionado,opciones)=>{
        return opciones.fn(this).replace(
            new RegExp(`value="${selecionado}"`),"$& selected='selected'"
        )
    },
    mostrarErrores:(errores = {},alertas)=>{
        const categoria = Object.keys(errores);
        let html='';
        if(categoria.length){
            errores[categoria].forEach(error => {
                html +=`
                    <div class="${categoria} alerta">
                        ${error}
                    </div>`;
            });
        }
        return alertas.fn().html = html;
    }
}