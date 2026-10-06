import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const logoutLink = document.getElementById('logoutLink');

logoutLink.addEventListener('click', (event) => {
    event.preventDefault();

    if (!confirm("Are you sure you want to logout?")) return;

    const auth = getAuth();

    signOut(auth)
        .then(() => {
            // Optional: also notify your backend to clear PHP session
            return fetch('./api/logout.php', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('Logged out successfully', 'success');
                window.location.href = '/hauzisha/index.php';
            } else {
                showToast('Backend logout failed: ' + data.message, 'error');
            }
        })
        .catch(err => {
            console.error(err);
            showToast('Error logging out. Try again.', 'error');
        });
});
