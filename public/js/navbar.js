document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobileToggle');
  const navbarNav = document.getElementById('navbarNav');

  mobileToggle.addEventListener('click', () => {
    navbarNav.classList.toggle('show');
  });

  // Adding scroll effect for navbar
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      navbar.style.background = 'rgba(15, 23, 42, 0.95)';
    } else {
      navbar.style.boxShadow = 'none';
      navbar.style.background = 'rgba(30, 41, 59, 0.8)';
    }
  });

  // Highlight active link based on URL
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    // Basic logic to determine active link
    if (link.getAttribute('href') === currentPath || 
        (currentPath === '/' && link.getAttribute('href') === '/index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
