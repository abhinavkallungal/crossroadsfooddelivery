$("#bar").click(function () {
    $(this).toggleClass("open");
    $("#page-content-wrapper ,#sidebar-wrapper").toggleClass("toggled");
});
//
 function toggleMenu() {
let navigation = document.querySelector(".navigation");
let toggle = document.querySelector(".toggle");

navigation.classList.toggle("active");
toggle.classList.toggle("active");
}