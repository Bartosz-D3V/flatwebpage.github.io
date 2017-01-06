window.onload = () => {
    const burger = document.getElementById("burger"),
        navBar = document.getElementById("nav"),
        phone = document.getElementById('phone'),
        tablet = document.getElementById('tablet'),
        devices = document.getElementById('devices-image');

    toggleClass(phone, 'slideInUp');
    tablet.style.display = 'none';
    devices.style.display = 'none';

    function toggleClass(element, className) {
        if (element.classList.contains(className)) {
            element.classList.remove(className);
        } else {
            element.classList.add(className);
        }
    }

    burger.addEventListener("click", function () {
        toggleClass(navBar, 'nav-show')
    }, false);

    let waypoint = new Waypoint({
        element: document.getElementById('waypoint-one'),
        handler: function () {
            tablet.style.display = '';
            toggleClass(tablet, 'fadeIn');
            this.destroy();
        }
    });

    let waypoint2 = new Waypoint({
        element: document.getElementById('waypoint-two'),
        handler: function () {
            devices.style.display = '';
            toggleClass(devices, 'zoomIn');
            this.destroy();
        }
    });
};