const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// 先生のFCMトークンを全部取得
async function getTeacherTokens() {
  const snap = await db.collection("fcmTokens").where("role", "==", "teacher").get();
  return snap.docs.map((d) => d.data().token).filter(Boolean);
}

// 先生全員に通知を送る
async function sendToTeachers(title, body) {
  const tokens = await getTeacherTokens();
  if (tokens.length === 0) {
    console.log("通知対象のトークンがありません");
    return;
  }
  const message = {
    notification: { title, body },
    tokens,
  };
  try {
    const response = await messaging.sendEachForMulticast(message);
    response.responses.forEach((res, idx) => {
      if (!res.success) {
        console.log("送信失敗:", tokens[idx], res.error && res.error.message);
      }
    });
  } catch (e) {
    console.error("通知送信エラー:", e);
  }
}

// ① 新しい質問が来たとき
exports.onNewQuestion = onDocumentCreated("questions/{questionId}", async (event) => {
  const data = event.data.data();
  const subject = data.subject || "数Ⅲ";
  const title = `📩 新しい質問（${subject}）`;
  const body = `No.${data.questionNumber || "-"}「${(data.text || "").substring(0, 30)}」`;
  await sendToTeachers(title, body);
});

// ② 新しいコメント（チャット）が来たとき（生徒からの発言のみ通知）
exports.onNewComment = onDocumentCreated(
  "questions/{questionId}/comments/{commentId}",
  async (event) => {
    const data = event.data.data();
    if (data.role !== "student") return; // 先生自身の発言では通知しない

    const questionId = event.params.questionId;
    const qSnap = await db.collection("questions").doc(questionId).get();
    const qData = qSnap.exists ? qSnap.data() : {};
    const subject = qData.subject || "数Ⅲ";

    const title = `💬 追加のやり取り（${subject}）`;
    const preview = data.text ? data.text.substring(0, 30) : "(画像が送信されました)";
    const body = `No.${qData.questionNumber || "-"}：${preview}`;
    await sendToTeachers(title, body);
  }
);
