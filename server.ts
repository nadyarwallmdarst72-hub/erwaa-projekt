import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK per gemini-api guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Assistant Endpoint for Owner & Supervisors only
app.post('/api/gemini/assist', async (req: Request, res: Response) => {
  try {
    const { prompt, role, mode, context } = req.body;

    // Verify staff access (owner or supervisor/teacher only)
    if (role !== 'owner' && role !== 'teacher') {
      res.status(403).json({ error: 'هذه الميزة مخصصة حصرياً لمالك المنصة والمشرفين والمعلمين.' });
      return;
    }

    if (!prompt && !context) {
      res.status(400).json({ error: 'الرجاء إرسال نص الاستفسار أو تفاصيل المحتوى.' });
      return;
    }

    let systemInstruction = `أنت المساعد الذكي المخصص لإدارة ومشرفي منصة إرواء التعليمية (المالك أحمد والمعلمون والمشرفون).
تساعد المالك والمشرفين فقط في:
- صياغة تمارين وتطبيقات عملية لكل محاضرة ودرس.
- اقتراح أسئلة اختبارات اختيار من متعدد دقيقة ومتنوعة.
- صياغة إعلانات وتوجيهات للطلاب بأسلوب أكاديمي مشجع.
- تقديم نصائح بيداغوجية لتطوير المقررات ورفع نسبة الحضور والتفاعل.
لغة الإجابة: اللغة العربية الفصحى الواضحة والمنظمة بنقاط منسقة.`;

    if (mode === 'generate_exercises') {
      systemInstruction += `\nالمطلوب توليد 2 إلى 3 تمارين تطبيقية للمحاضرة المحددة. لكل تمرين، اذكر العنوان، وصف المطلوب بالتفصيل، وتلميحاً مبسطاً للحل.`;
    } else if (mode === 'generate_quiz') {
      systemInstruction += `\nالمطلوب توليد 3 أسئلة اختيار من متعدد للمقرر. لكل سؤال، اكتب نص السؤال، 4 خيارات، ورقم الخيار الصحيح (من 0 إلى 3).`;
    } else if (mode === 'draft_announcement') {
      systemInstruction += `\nالمطلوب صياغة إعلان جذاب ومنسق مع عنوان واضح وموجز ونص يشرح التفاصيل.`;
    }

    const contents = `السياق الحالي: ${JSON.stringify(context || {})}
الطلب أو الاستفسار: ${prompt || 'قم بإنشاء المقترح المناسب وفق السياق'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || '';
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Gemini Assist Error:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء معالجة طلب الذكاء الاصطناعي: ' + (error?.message || 'خطأ غير معروف'),
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
