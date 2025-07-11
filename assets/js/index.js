/*
 * Toggle hamburger menu
 */
const toggle = document.querySelector('.js-menu-toggle');
const menu = document.querySelector('.js-menu');

if(toggle && menu) { 
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });
}

/*
 * Header on scroll
 */
const hdr = document.querySelector('.header');
function hdrScrolled() {
  if (hdr) {
    if (window.pageYOffset > 100) {
      hdr.classList.add('scrolled');
    } else {
      hdr.classList.remove('scrolled');
    }
  }
}

hdrScrolled();
if (hdr) {
  window.addEventListener('scroll', () => {
    hdrScrolled();
  });
}