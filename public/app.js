const demoButton = document.getElementById("demoButton");
const chatLog = document.getElementById("chatLog");
const loadingCopy = document.getElementById("loadingCopy");
const nightMessage = document.getElementById("nightMessage");

const loadingMessages = [
  "分析中…👀",
  "くれぴがレシピ本を爆速でめくっています📖💨",
  "しおれ気味食材の救済プランを考え中…🥬",
];

const demoResponse = `わー！今日はいいものいっぱい入ってるね〜😆
・鶏もも肉 300gくらい（新鮮！）
・キャベツ 半玉（少ししおれ気味なので優先）
・卵 3個（まだ元気！）

【レシピ1】鶏キャベツ味噌炒め（12分・2人分）
追加: 味噌 / みりん
作り方: 1)切る 2)炒める 3)味付け

【レシピ2】ふわふわ卵とじスープ（10分・2人分）
追加: だし / しょうゆ
作り方: 1)煮る 2)卵を回し入れる 3)仕上げ

【レシピ3】もったいないお好み焼き風（15分・2人分）
追加: 小麦粉 / ソース
作り方: 1)混ぜる 2)焼く 3)仕上げ

これで今日のご飯決まりだね！感想も教えて〜🍳`;

function appendBubble(message, role) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = message;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
  return bubble;
}

function typeText(element, text, speed = 18) {
  return new Promise((resolve) => {
    let index = 0;
    const timer = setInterval(() => {
      element.textContent += text[index];
      index += 1;
      chatLog.scrollTop = chatLog.scrollHeight;

      if (index >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

async function runDemo() {
  demoButton.disabled = true;
  demoButton.textContent = "くれぴが分析中…";
  chatLog.innerHTML = "";

  appendBubble("冷蔵庫の写真を送ってみる", "user");
  appendBubble("📸 冷蔵庫の写真を送信しました", "user");

  let loadingIndex = 0;
  loadingCopy.textContent = loadingMessages[loadingIndex];
  const loadingTimer = setInterval(() => {
    loadingIndex = (loadingIndex + 1) % loadingMessages.length;
    loadingCopy.textContent = loadingMessages[loadingIndex];
  }, 1300);

  await new Promise((resolve) => setTimeout(resolve, 2300));
  const botBubble = appendBubble("", "bot");
  await typeText(botBubble, demoResponse);

  clearInterval(loadingTimer);
  loadingCopy.textContent = "くれぴ体験おつかれさま！もう一回できるよ✨";
  demoButton.disabled = false;
  demoButton.textContent = "もう一回デモする";
}

function setupRevealAnimation() {
  const targets = document.querySelectorAll(".reveal-target");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.22 }
  );

  targets.forEach((target) => observer.observe(target));
}

function updateNightMessage() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  nightMessage.textContent = isDark
    ? "ミッドナイト・くれぴ: 夜食さがしてるの？太らないレシピ教えるよ🤫"
    : "くれぴ: 今日のごはん、楽しく作ろうね〜☀️";
}

demoButton?.addEventListener("click", runDemo);
setupRevealAnimation();
updateNightMessage();

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", updateNightMessage);
