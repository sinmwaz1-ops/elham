const socket = io();
const currentUser = localStorage.getItem('elhlok_user');

// إذا لم يجد اسم مستخدم (أي لم يسجل الدخول)، يعيده لصفحة الدخول
if (!currentUser) {
    window.location.href = '/';
}

document.getElementById('current-user').textContent = `أنت: ${currentUser}`;

const messages = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// وظيفة لعرض الرسائل في منطقة الدردشة
function displayMessage(user, text) {
    const isSelf = user === currentUser;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isSelf ? 'self' : 'other');

    const textSpan = document.createElement('span');
    textSpan.classList.add('message-text');
    textSpan.textContent = text;
    
    // إضافة اسم المرسل إذا لم يكن المستخدم نفسه
    if (!isSelf) {
        textSpan.innerHTML = `<strong>${user}:</strong> ${text}`;
    }

    messageDiv.appendChild(textSpan);
    messages.appendChild(messageDiv);
    
    // التمرير لأسفل تلقائيًا
    messages.scrollTop = messages.scrollHeight;
}

// إرسال الرسالة إلى الخادم
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = messageInput.value.trim();
    if (msg) {
        socket.emit('chat_message', msg);
        messageInput.value = ''; // مسح حقل الإدخال
    }
});

// استقبال الرسائل الجديدة من الخادم
socket.on('new_message', (data) => {
    displayMessage(data.user, data.text);
});

// استقبال تنبيهات حالة المستخدم (انضم/غادر)
socket.on('user_status', (statusText) => {
    const statusDiv = document.createElement('div');
    statusDiv.classList.add('text-center', 'text-muted', 'my-2');
    statusDiv.textContent = statusText;
    messages.appendChild(statusDiv);
    messages.scrollTop = messages.scrollHeight;
});