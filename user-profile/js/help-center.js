// Help Center JavaScript logic

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    });
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isOpen = faqItem.classList.contains('open');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('open');
        });
        
        // Open clicked item if it wasn't open
        if (!isOpen) {
            faqItem.classList.add('open');
        }
    });
});

// Support ticket form submission
document.getElementById('supportTicketForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const subject = document.getElementById('ticketSubject').value.trim();
    const category = document.getElementById('ticketCategory').value;
    const message = document.getElementById('ticketMessage').value.trim();
    
    if (!subject || !category || !message) {
        showMessage('All fields are required', 'danger');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('category', category);
        formData.append('message', message);
        
        const response = await fetch('/hauzisha/api/index.php/submit-support-ticket', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Support ticket submitted successfully! We\'ll get back to you soon.', 'success');
            document.getElementById('supportTicketForm').reset();
        } else {
            showMessage(data.error || 'Failed to submit ticket', 'danger');
        }
    } catch (error) {
        console.error('Error submitting ticket:', error);
        showMessage('An error occurred while submitting your ticket', 'danger');
    }
});

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('ticketMessage');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove('d-none');
    
    setTimeout(() => {
        messageDiv.classList.add('d-none');
    }, 5000);
}
