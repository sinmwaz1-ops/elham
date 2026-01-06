// استيراد المكتبات
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- 1. إعداد قائمة المستخدمين المصرح لهم ---
const allowedUsers = {
    "Elham": "elham123", // كلمة مرور الهام
    "Malouk": "malouk123"  // كلمة مرور ملوك
};

// --- 2. تتبع المستخدمين المتصلين حاليًا ---
let connectedUsers = {}; // { username: socketId }

// تقديم ملفات الواجهة الأمامية الثابتة (HTML, CSS, JS)
app.use(express.static(__dirname));

// التوجيه لصفحة الدخول
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// التوجيه لصفحة الدردشة
app.get('/chat', (req, res) => {
    // يمكن هنا إضافة تحقق أولي إذا كان المستخدم قد سجل الدخول
    res.sendFile(__dirname + '/chat.html');
});


// --- 3. منطق Socket.IO (القلب النابض للدردشة) ---
io.on('connection', (socket) => {
    console.log(`مستخدم جديد حاول الاتصال. ID: ${socket.id}`);

    // استقبال محاولة الدخول من العميل
    socket.on('login_attempt', ({ username, password }) => {
        const storedPassword = allowedUsers[username];
        const userCount = Object.keys(connectedUsers).length;

        // التحقق من صلاحية المستخدم
        if (storedPassword && storedPassword === password) {
            
            // التحقق من عدد المستخدمين (قيد الشات لـ 2 فقط)
            if (connectedUsers[username]) {
                // المستخدم نفسه يحاول الاتصال مرة أخرى (مسموح)
                connectedUsers[username] = socket.id; // تحديث معرف السوكت
                socket.emit('login_success', { username });
            } else if (userCount < 2) {
                // دخول ناجح ومسموح
                connectedUsers[username] = socket.id;
                console.log(`${username} قام بالدخول بنجاح.`);
                socket.emit('login_success', { username });
                // إرسال تنبيه للطرف الآخر
                io.emit('user_status', `${username} انضم إلى الدردشة.`);
            } else {
                // محاولة دخول غير مصرح بها (الشات ممتلئ)
                socket.emit('login_error', 'ElhLok Chat ممتلئ. شخصان فقط مسموح بهما.');
            }
        } else {
            // بيانات دخول غير صحيحة
            socket.emit('login_error', 'اسم المستخدم أو كلمة المرور غير صحيحة.');
        }
    });

    // استقبال رسالة من مستخدم
    socket.on('chat_message', (msg) => {
        const username = Object.keys(connectedUsers).find(key => connectedUsers[key] === socket.id);
        
        if (username) {
            // إرسال الرسالة إلى جميع المتصلين (بما في ذلك المرسل نفسه لتحديث شاشته)
            io.emit('new_message', {
                user: username,
                text: msg
            });
        }
    });

    // التعامل مع قطع الاتصال
    socket.on('disconnect', () => {
        const username = Object.keys(connectedUsers).find(key => connectedUsers[key] === socket.id);
        
        if (username) {
            delete connectedUsers[username];
            console.log(`${username} قام بقطع الاتصال.`);
            // إرسال تنبيه للطرف الآخر
            io.emit('user_status', `${username} غادر الدردشة.`);
        }
    });
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`ElhLok Chat يعمل على http://localhost:${PORT}`);
    console.log('--- الخادم جاهز ---');
});