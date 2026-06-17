// sw.js - Firebase Cloud Messaging 用 Service Worker
// ※ このファイルは teacher.html と同じフォルダに置いてください

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBq1duOlOzcRjqCnxl8lfnhzOQVhKtusSg",
  authDomain: "question-site-241aa.firebaseapp.com",
  projectId: "question-site-241aa",
  storageBucket: "question-site-241aa.firebasestorage.app",
  messagingSenderId: "597218408483",
  appId: "1:597218408483:web:ddd57136505554d6989996"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// バックグラウンド（画面を閉じているとき）の通知受信
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: "https://via.placeholder.com/192x192/d32f2f/ffffff?text=C",
    badge: "https://via.placeholder.com/96x96/d32f2f/ffffff?text=C",
    vibrate: [200, 100, 200]
  });
});
