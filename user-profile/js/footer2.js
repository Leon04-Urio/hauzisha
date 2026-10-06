document.addEventListener('DOMContentLoaded', () => {
  const footer = document.getElementById('footer2');
  const mobileNav = document.querySelector('.mobile-bottom-nav');

  if (!footer || !mobileNav) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          mobileNav.style.opacity = '0';
          mobileNav.style.pointerEvents = 'none';
          mobileNav.style.transform = 'translateY(100%)';
        } else {
          mobileNav.style.opacity = '1';
          mobileNav.style.pointerEvents = 'auto';
          mobileNav.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(footer);
});