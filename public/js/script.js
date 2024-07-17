// Funcion para el menu de hamburguesa 
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

// funcion para agregar una clase de activo cuando este posicionado en un enlace de la navegacion
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#nav-links li a');
    navLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('activo');
        }
    });
});

// funcion para limitar los digitos en el input de telefono

function limitarCantDigitos(element, maxLength){
    if (element.value.length > maxLength){
        element.value = element.value.slice(0, maxLength)
    }

}

