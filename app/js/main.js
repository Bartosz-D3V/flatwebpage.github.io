window.onload = () => {
    const burger = document.getElementById("burger"),
        navBar = document.getElementById("nav");

    function toggleClass(object) {
        if (object.classList.contains('nav-show')) {
            object.classList.remove('nav-show');
        } else {
            object.classList.add('nav-show');
        }
    }

    burger.addEventListener("click", function () {
        toggleClass(navBar)
    }, false);
};