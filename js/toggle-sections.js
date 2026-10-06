document.addEventListener('DOMContentLoaded', () => {
    const btnProperties = document.getElementById('btn-properties');
    const btnShowroom = document.getElementById('btn-showroom');
    const propertiesSection = document.getElementById('properties-section');
    const showroomSection = document.getElementById('showroom-section');
  
    if (!btnProperties || !btnShowroom || !propertiesSection || !showroomSection) return;
  
    btnProperties.addEventListener('click', () => {
      btnProperties.classList.add('active');
      btnShowroom.classList.remove('active');
      propertiesSection.style.display = 'block';
      showroomSection.style.display = 'none';
    });
  
    btnShowroom.addEventListener('click', () => {
      btnShowroom.classList.add('active');
      btnProperties.classList.remove('active');
      showroomSection.style.display = 'block';
      propertiesSection.style.display = 'none';
    });
  });
  