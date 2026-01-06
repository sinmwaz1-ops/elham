document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginMessage = document.getElementById('login-message');

    // لكي نستخدم Socket.IO لعملية الدخول فقط
    const socket = io();

    socket.emit('login_attempt', { username, password });
    
    socket.on('login_success', (data) => {
        // عند النجاح، حفظ اسم المستخدم وتوجيهه لصفحة الدردشة
        localStorage.setItem('elhlok_user', data.username);
        window.location.href = '/chat';
    });

    socket.on('login_error', (message) => {
        // عرض رسالة الخطأ
        loginMessage.textContent = message;
        loginMessage.classList.remove('d-none');
    });
});