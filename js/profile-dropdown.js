document.addEventListener('DOMContentLoaded', () => {
  const userProfile = document.getElementById('userProfile');
  const dropdown = document.getElementById('profileDropdown');

  if (!userProfile || !dropdown) return;

  userProfile.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Close dropdown if clicked outside
  document.addEventListener('click', (e) => {
    if (!userProfile.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
});