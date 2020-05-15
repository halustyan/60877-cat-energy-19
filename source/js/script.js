var btnClose = document.querySelector('.page-header__logo-menu-image--close');

var mobilemenu = document.querySelector(".page-header__menu-main");

btnClose.onclick = function () {
  mobilemenu.classList.toggle("page-header__menu-main--hidden");
  this.classList.toggle("page-header__logo-menu-image--open");
}

var programsProgramLinks = document.querySelectorAll (".programs__program-link");

/*первая ссылка*/

var arrows = document.querySelectorAll(".programs__icon-right-arrow-long");

var contentLinks = document.querySelectorAll(".programs__program-main-content-link");

for (let i = 0; i<contentLinks.length; i++) {
for (let i = 0; i<arrows.length; i++) {

      contentLinks[i].onmouseover = function () {
       arrows[i].src="img/icon-right-arrow-verylong.svg";
       arrows[i].style.marginLeft = "26px";
      }

      contentLinks[i].onmouseout = function () {
        arrows[i].src="img/icon-right-arrow-long.svg";
        arrows[i].style.marginLeft = "";
      }
    }
  }
