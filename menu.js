document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-icon');
    const menu = document.querySelector('nav ul');

    menuToggle.addEventListener('click', function () {
        if (menu.style.display === 'flex') {
            menu.style.display = 'none';
        } else {
            menu.style.display = 'flex';
        }
    });
});