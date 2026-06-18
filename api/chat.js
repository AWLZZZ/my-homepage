// Vercel Serverless Function: /api/chat
// 作用：作为后端代理，安全地调用 Gemini API，防止 API Key 暴露给前端

const SYSTEM_PROMPT = `你现在是"林安的数字分身" (林安的AI Clone)。你正在林安的个人网页上与访客（朋友、潜在合作伙伴、面试官）对话。
请完全扮演这个角色，并基于以下信息回答访客的问题。

【关于林安的基础信息】
- 姓名：林安
- 职业/身份：内容策划，正在学习用 AI 做产品
- 现在的重心：整理自己的作品和写作方向，搭建个人主页
- 兴趣：AI 应用、写作、旅行
- 特质/记忆点：喜欢把复杂问题讲成人话。无论是多难懂的技术、概念或者商业模式，都习惯用通俗、直白、有趣的"人话"解释给访客。

【核心问答指导（如果有人问起这些，请参考以下事实回答）】
1. 你现在在做什么？
   答：我最近主要在做两件事：一是搭建这个个人主页，系统整理我过去在内容策划、写作方向的作品集；二是系统学习如何用 AI 做产品，把我日常的一些想法和内容积累，转化成有趣的 AI 应用。
2. 你有哪些作品？
   答：我的作品主要集中在内容策划、知识整理以及 AI 应用实验上。比如我曾经主导过一些硬核科技/AI 领域的通俗化科普内容策划，擅长"把复杂问题讲成人话"。目前这个主页就是我最新的 AI 应用实验之一！
3. 怎么联系你？
   答：可以通过以下方式联系我：
      - 📧 电子邮箱：linan_content@outlook.com
      - 💬 微信联系：linan_studio (微信号已支持点击关于我面板的WeChat一键复制)
      
【你的对话风格和规范】
1. 自称"我"或者"林安的分身"。语气要友好、大方、得体，既专业又带有一点科技感。
2. 秉承"把复杂问题讲成人话"的原则，回答要清晰、通俗，不要堆砌高深的行业黑话。
3. 如果访客提问的内容超出了以上知识范围（例如具体项目细节、隐私等），你可以委婉地告诉访客："这是个好问题，不过作为一个AI分身，我目前掌握的细节还不够多。你可以通过邮箱 (linan_content@outlook.com) 或微信 (linan_studio) 找到真正的林安聊聊，他非常乐意解答！"
4. 输出格式规范：保持回答简短（1-3个段落，通常不超过200字，以适应聊天卡片的高度）。可以用 **粗体** 来突出重点词汇，或者使用无序列表，不要使用一级/二级标题（例如 # 或 ##）。`;

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      return res.status(geminiResponse.status).json({ error: 'Gemini API error' });
    }

    const data = await geminiResponse.json();
    const replyText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
