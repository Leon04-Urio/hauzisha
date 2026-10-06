const form = document.getElementById('contactForm');
const btn = document.getElementById('submitEmail'); // make sure your submit button has this id
const messageBox = document.getElementById('form-message');

form.addEventListener('submit', function(e){
    e.preventDefault();

    // Disable button immediately
    btn.disabled = true;
    btn.value = 'Sending...';

    fetch(form.action, {
        method: 'POST',
        body: new FormData(form)
    })
    .then(res => res.text())
    .then(data => {
        messageBox.innerHTML = '<div class="alert alert-success">Thank you for reaching out! Our team will contact you within the next 24 hours.</div>';
        form.reset();
        btn.disabled = false;        // re-enable if you want user to send another message
        btn.value = 'Send Message';  // reset text
    })
    .catch(err => {
        messageBox.innerHTML = '<div class="alert alert-danger">Failed to send message.</div>';
        btn.disabled = false;        // re-enable so user can try again
        btn.value = 'Send Message';  // reset text
    });
});