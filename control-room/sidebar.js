(function () {
    const sidebar     = document.getElementById('sidebar');
    const toggleBtn   = document.getElementById('toggleSidebar');
    const overlay     = document.querySelector('.overlay');
    const mainContent = document.querySelector('.main-content') || document.querySelector('.user-main-content');
  
    if (!sidebar || !toggleBtn) return; // nothing to do
  
    // Avoid initial animation flash
    sidebar.classList.add('no-anim');
    requestAnimationFrame(() => sidebar.classList.remove('no-anim'));
  
    function adjustContent() {
      if (!mainContent) return;
    
      if (window.innerWidth >= 768) {
        // Desktop logic
        sidebar.classList.remove('open'); // ensure clean desktop first
        if (overlay) overlay.classList.remove('show');
        mainContent.style.marginLeft = sidebar.classList.contains('collapsed') ? '70px' : '250px';
      } else {
        // Mobile logic
        sidebar.classList.remove('collapsed'); // always reset collapsed on mobile
        mainContent.style.marginLeft = '0';
      }
    }       
  
    // Initial layout pass (uses whatever the HTML has — collapsed by default)
    adjustContent();
  
    // Toggle button
    toggleBtn.addEventListener('click', () => {
      if (window.innerWidth >= 768) {
        sidebar.classList.toggle('collapsed');
      } else {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('show');
      }
      adjustContent();
    });
  
    // Overlay (mobile)
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
  
    // Keep spacing correct on resize
    window.addEventListener('resize', adjustContent);
  })();
  


  

// const sidebar = document.querySelector('.sidebar');
// const toggleBtn = document.getElementById('toggleSidebar');
// const overlay = document.querySelector('.overlay');

// toggleBtn.addEventListener('click', () => {
//     if (window.innerWidth >= 768) {
//         sidebar.classList.toggle('collapsed');
//         document.querySelector('.main-content').style.marginLeft = sidebar.classList.contains('collapsed') ? '70px' : '250px';
//     } else {
//         sidebar.classList.toggle('open');
//         overlay.classList.toggle('show');
//     }
// });

// overlay.addEventListener('click', () => {
//     sidebar.classList.remove('open');
//     overlay.classList.remove('show');
// });