$(document).ready(function () {
    var phone = $('#phone'),
        tablet = $('#tablet'),
        devices = $('#devices'),
        socialBtns = $('#socialBtns');

    tablet.hide();
    devices.hide();
    socialBtns.hide();

    $('.waipoint1').waypoint(function (direction) {
        phone.addClass('slideInUp');
        this.destroy();
    }, {offset: '50%'});

    $('.waipoint2').waypoint(function (direction) {
        tablet.addClass('zoomInRight');
        tablet.show();
        this.destroy();
    }, {offset: '50%'});

    $('.waipoint3').waypoint(function (direction) {
        devices.addClass('slideInUp');
        devices.show();
        this.destroy();
    }, {offset: '50%'});

    $('.waipoint4').waypoint(function (direction) {
        socialBtns.addClass('bounceIn');
        socialBtns.show();
        this.destroy();
    }, {offset: '50%'});

});