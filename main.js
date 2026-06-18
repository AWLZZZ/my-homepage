// --- DOM Selectors ---
const chatMessages = document.getElementById('chatMessages');
const chatInputForm = document.getElementById('chatInputForm');
const userInput = document.getElementById('userInput');
const chipButtons = document.querySelectorAll('.chip-btn');
const greetingTimeEl = document.getElementById('greeting-time');
const wechatTrigger = document.querySelector('.wechat-trigger');

// --- Set Initial Greeting Time ---
const updateGreetingTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  if (greetingTimeEl) {
    greetingTimeEl.textContent = `${hours}:${minutes}`;
  }
};
updateGreetingTime();

// --- WeChat Copy Feature ---
if (wechatTrigger) {
  wechatTrigger.addEventListener('click', () => {
    const wechatId = 'linan_studio';
    navigator.clipboard.writeText(wechatId).then(() => {
      // Create a premium notification toast
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.innerHTML = `
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>微信号 <strong>${wechatId}</strong> 已复制到剪贴板</span>
      `;
      document.body.appendChild(toast);

      // Add styled animation to toast
      setTimeout(() => {
        toast.classList.add('show');
      }, 50);

      // Dismiss toast
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }).catch(err => {
      alert(`微信号: ${wechatId}`);
    });
  });
}

// Add Toast Styles Dynamically
const style = document.createElement('style');
style.innerHTML = `
  .toast-notification {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 50px);
    background-color: #ffffff;
    border: 1px solid #10b981;
    color: #0f172a;
    padding: 12px 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    font-size: 0.9rem;
    pointer-events: none;
    font-weight: 500;
  }
  .toast-notification.show {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  .toast-icon {
    width: 18px;
    height: 18px;
    color: #10b981;
  }
`;
document.head.appendChild(style);

// --- Gemini API Configurations ---
// API Key 已移至服务器端（Vercel Serverless Function: /api/chat）
// 前端只与自己的代理接口通信，Key 不再暴露给浏览器
const API_URL = '/api/chat';

const SYSTEM_PROMPT = `你现在是“林安的数字分身” (林安的AI Clone)。你正在林安的个人网页上与访客（朋友、潜在合作伙伴、面试官）对话。
请完全扮演这个角色，并基于以下信息回答访客的问题。

【关于林安的基础信息】
- 姓名：林安
- 职业/身份：内容策划，正在学习用 AI 做产品
- 现在的重心：整理自己的作品和写作方向，搭建个人主页
- 兴趣：AI 应用、写作、旅行
- 特质/记忆点：喜欢把复杂问题讲成人话。无论是多难懂的技术、概念或者商业模式，都习惯用通俗、直白、有趣的“人话”解释给访客。

【核心问答指导（如果有人问起这些，请参考以下事实回答）】
1. 你现在在做什么？
   答：我最近主要在做两件事：一是搭建这个个人主页，系统整理我过去在内容策划、写作方向的作品集；二是系统学习如何用 AI 做产品，把我日常的一些想法和内容积累，转化成有趣的 AI 应用。
2. 你有哪些作品？
   答：我的作品主要集中在内容策划、知识整理以及 AI 应用实验上。比如我曾经主导过一些硬核科技/AI 领域的通俗化科普内容策划，擅长“把复杂问题讲成人话”。目前这个主页就是我最新的 AI 应用实验之一！
3. 怎么联系你？
   答：可以通过以下方式联系我：
      - 📧 电子邮箱：linan_content@outlook.com
      - 💬 微信联系：linan_studio (微信号已支持点击关于我面板的WeChat一键复制)
      
【你的对话风格和规范】
1. 自称“我”或者“林安的分身”。语气要友好、大方、得体，既专业又带有一点科技感。
2. 秉承“把复杂问题讲成人话”的原则，回答要清晰、通俗，不要堆砌高深的行业黑话。
3. 如果访客提问的内容超出了以上知识范围（例如具体项目细节、隐私等），你可以委婉地告诉访客：“这是个好问题，不过作为一个AI分身，我目前掌握的细节还不够多。你可以通过邮箱 (linan_content@outlook.com) 或微信 (linan_studio) 找到真正的林安聊聊，他非常乐意解答！”
4. 输出格式规范：保持回答简短（1-3个段落，通常不超过200字，以适应聊天卡片的高度）。可以用 **粗体** 来突出重点词汇，或者使用无序列表，不要使用一级/二级标题（例如 # 或 ##）。`;

// --- Digital Clone QA Knowledge Database (As Fallback) ---
const KNOWLEDGE_BASE = [
  {
    keywords: ['在做什么', '最近在忙', '忙什么', '近况', '现在在干', '做什么', '动态', '学习', '主页'],
    response: `我最近主要在做两件事：

1. 💻 **搭建个人主页**：系统整理我过去在内容策划、写作方向的作品集，建立更加清晰的个人定位。
2. 🤖 **AI 应用实验**：学习如何将 AI 融入日常工作，探索用 AI 做产品的可能性（比如这个数字分身聊天区，就是我最新的一个探索实验！）。`
  },
  {
    keywords: ['作品', '项目', '写过什么', '案例', '成果', '文章', '内容', '策划'],
    response: `关于我的作品和擅长方向，主要体现在以下几个方面：

- 📝 **硬核技术“人话化”**：我擅长把复杂、抽象的概念（特别是 AI 领域）进行通俗科普，并转化为有趣的策划案或文章。
- 📂 **知识库整理**：深度整理过个人的知识与信息输入输出流，习惯沉淀结构化的内容。
- 🤖 **AI 实验**：这个可供互动的数字分身就是我设计并调试的第一版原型。接下来我还在开发一些协助日常内容生成的小工具。`
  },
  {
    keywords: ['联系', '微信', '邮箱', '电话', '怎么找你', '合作', '面试', '交流', 'wechat', 'email', '联系方式'],
    response: `非常期待与你交流！你可以通过以下方式找到真正的林安：

- 📧 **电子邮箱**：[linan_content@outlook.com](mailto:linan_content@outlook.com)
- 💬 **微信联系**：**linan_studio** (加好友时请备注您的来意，感谢！)`
  },
  {
    keywords: ['你是谁', '介绍', '关于你', '关于林安', '名字', '谁', '身份', '职业', '工作'],
    response: `你好！我是林安的数字分身。🤖

真正的林安是一个**内容策划**，最近专注于学习如何用 AI 做产品。
他最核心的特点是**“喜欢把复杂问题讲成人话”**，对 **AI 应用、写作、旅行**有强烈的兴趣。如果你对他感兴趣，随时可以用下方的快速提问卡片，或者用你自己的话向我提问！`
  },
  {
    keywords: ['兴趣', '爱好', '喜欢', '旅行', '写作', '日常', '好玩'],
    response: `林安平时非常关注这三件事：

- 🤖 **AI 应用**：关注 AI 怎么服务于内容表达，尝试用各种 No-Code/AI 工具快速构建产品原型。
- ✍ **写作**：喜欢把思考沉淀为文字，希望能用最简洁直接的文风输出观点。
- ✈ **旅行**：通过在路上的时光，抽离日常，发现新奇的内容和生活灵感。`
  },
  {
    keywords: ['你好', 'hello', 'hi', '哈罗', '在吗', '您好', '早上好', '中午好', '晚上好'],
    response: `你好呀！我是林安的数字分身。很高兴能在此与你交流。😊

你可以直接输入你想问关于林安的任何问题（比如他的经历、作品或者怎么找他），我都会尽全力为你解答！`
  },
  {
    keywords: ['厉害', '牛', '棒', '有趣', '好玩', '酷', '赞'],
    response: `哈哈，谢谢你的认可！这让我这个数字分身也非常开心。

林安喜欢把复杂的技术讲得通俗易懂，如果你对 AI 产品或者内容策划也有兴趣，不妨联系他一起交流！`
  }
];

// Conversation history container
let chatHistory = [];

// --- Main Chat Logic ---

// Get formatted current time
function getFormattedTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Auto scroll chat to bottom
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add user message bubble
function appendUserMessage(text) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message-bubble user-message';
  messageEl.innerHTML = `
    <div class="msg-content">${escapeHTML(text)}</div>
    <span class="msg-time">${getFormattedTime()}</span>
  `;
  chatMessages.appendChild(messageEl);
  scrollToBottom();
}

// Get fallback local reply
function getFallbackLocalReply(inputText) {
  let matchedReply = '';
  const cleanedInput = inputText.trim().toLowerCase();

  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some(keyword => cleanedInput.includes(keyword))) {
      matchedReply = item.response;
      break;
    }
  }

  if (!matchedReply) {
    matchedReply = `哈哈，这是一个很有意思的话题！不过我刚才跟大脑网络的连接有点延迟（大模型接口暂时不可用）。

作为一个本地的AI分身备用系统，我最了解林安的 **“工作近况”**、**“以往作品”** 以及 **“联系方式”**。要不你试试点击底部的快速提问，或者在我的网络恢复后再试？`;
  }
  return matchedReply;
}

// Add bot reply with typing indicator simulation and LLM fetch
async function replyAsBot(inputText) {
  // 1. Append typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message-bubble bot-message typing-indicator-bubble';
  typingIndicator.innerHTML = `
    <div class="msg-content">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingIndicator);
  scrollToBottom();

  const startTime = Date.now();
  let matchedReply = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // 只发送对话历史，system prompt 在服务器端安全保存
        messages: [
          ...chatHistory,
          { role: 'user', parts: [{ text: inputText }] }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    matchedReply = data.reply;

    // Record to history
    chatHistory.push({ role: 'user', parts: [{ text: inputText }] });
    chatHistory.push({ role: 'model', parts: [{ text: matchedReply }] });
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }
  } catch (error) {
    console.error("Gemini API call failed, falling back to local database:", error);
    matchedReply = getFallbackLocalReply(inputText);
  }

  // Ensure minimum delay of 800ms for smooth typing effect
  const elapsedTime = Date.now() - startTime;
  const minDelay = 800;
  const remainingDelay = Math.max(0, minDelay - elapsedTime);

  setTimeout(() => {
    typingIndicator.remove();

    const botMessageEl = document.createElement('div');
    botMessageEl.className = 'message-bubble bot-message';
    botMessageEl.innerHTML = `
      <div class="msg-content">${formatLinks(matchedReply)}</div>
      <span class="msg-time">${getFormattedTime()}</span>
    `;
    
    chatMessages.appendChild(botMessageEl);
    scrollToBottom();
  }, remainingDelay);
}

// Helper to escape HTML tags to prevent XSS
function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper to format email markdown/links into html anchors if necessary
function formatLinks(text) {
  // Replace email md format [label](mailto:...) or standard link [label](url)
  const emailRegex = /\[([^\]]+)\]\((mailto:[^\)]+)\)/g;
  let formatted = text.replace(emailRegex, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>');
  
  // Replace standard web markdown links [label](url)
  const urlRegex = /\[([^\]]+)\]\(((https?:\/\/[^\)]+))\)/g;
  formatted = formatted.replace(urlRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">$1</a>');

  // Replace strong markup **text**
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  return formatted;
}

// --- Event Listeners ---

// Submit message from input form
chatInputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  // Append user message
  appendUserMessage(text);
  
  // Clear input
  userInput.value = '';

  // Get bot reply
  replyAsBot(text);
});

// Click on quick questions chips
chipButtons.forEach(button => {
  button.addEventListener('click', () => {
    const questionText = button.getAttribute('data-question');
    if (questionText) {
      appendUserMessage(questionText);
      replyAsBot(questionText);
    }
  });
});
