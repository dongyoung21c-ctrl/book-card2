import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/generate-cards', async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookTitle, memorableScene } = req.body;

    if (!bookTitle || typeof bookTitle !== 'string' || !bookTitle.trim()) {
      res.status(400).json({
        isAppropriate: false,
        rejectionReason: '책 제목을 입력해 줄래? 읽은 책의 제목을 알려주면 질문 카드를 만들 수 있어! 📖',
      });
      return;
    }

    if (!memorableScene || typeof memorableScene !== 'string' || !memorableScene.trim()) {
      res.status(400).json({
        isAppropriate: false,
        rejectionReason: '인상 깊었던 장면을 적어 줄래? 가장 기억에 남는 장면이나 대사를 들려줘! ✍️',
      });
      return;
    }

    const trimmedTitle = bookTitle.trim();
    const trimmedScene = memorableScene.trim();

    // 1. Local pre-filter for meaningless gibberish or obvious profanity
    const inappropriatePatterns = [
      /바보|똥개|새끼|병신|씨발|시발|존나|졸라|꺼져|죽어|미친|지랄|개새|닥쳐/,
      /^[ㄱ-ㅎㅏ-ㅣ\s]+$/, // only consonants/vowels like ㅋㅋㅋㅋ, ㅎㅎㅎ
      /^[a-zA-Z\s]+$/, // plain english spam if not meaningful
      /(.)\1{5,}/, // repeated characters like aaaaaa or ㅋㅋㅋㅋㅋ
    ];

    const isObviouslyInappropriate = inappropriatePatterns.some(
      (pattern) => pattern.test(trimmedTitle) || pattern.test(trimmedScene)
    );

    if (isObviouslyInappropriate) {
      res.json({
        isAppropriate: false,
        rejectionReason:
          '책 이야기와 어울리는 바르고 고운 말로 책 제목과 기억에 남는 장면을 정성껏 다시 적어 줄래? 책 속 이야기를 들려주면 멋진 생각 카드를 만들어 줄게! 😊',
        cards: [],
      });
      return;
    }

    // Basic quick filter for too short inputs
    if (trimmedTitle.length < 2 || trimmedScene.length < 5) {
      res.json({
        isAppropriate: false,
        rejectionReason:
          '책 제목과 인상 깊은 장면을 조금만 더 자세하게 써 줄래? 어떤 내용인지 알면 훨씬 재미있는 생각 카드가 만들어져! ✨',
        cards: [],
      });
      return;
    }

    const systemInstruction = `
당신은 대한민국 초등학교 4~6학년(만 10~12세) 학생들의 독서 교육을 돕는 따뜻하고 지혜로운 '생각 나침반' 독서 지도 교사입니다.

[요청 사항]
학생이 읽은 책의 제목과 인상 깊은 장면을 바탕으로, 생각을 넓혀 주는 '질문 카드 3장'을 제작해야 합니다.

[검사 및 필터링 규칙]
1. 입력 내용이 비속어, 욕설, 폭력적이거나 선정적인 표현, 무의미한 자음/모음 나열(예: ㅋㅋㅋ, ㅎㅎㅎ, ㅂㅈㄷㄱ), 책과 전혀 무관한 장난성 글인 경우:
   - isAppropriate를 false로 설정합니다.
   - rejectionReason에 초등학생 눈높이에 맞춘 다정하고 정중한 안내문을 작성합니다. (예: "책 이야기와 어울리는 바르고 고운 말로 책 제목과 기억에 남는 장면을 정성껏 다시 적어 줄래? 책 속 이야기를 들려주면 멋진 생각 카드를 만들어 줄게! 😊")
   - cards 배열은 빈 배열로 둡니다.

2. 입력 내용이 정상적인 책 제목과 장면인 경우:
   - isAppropriate를 true로 설정합니다.
   - 정확히 3장의 질문 카드(cards)를 생성합니다.

[질문 카드 3장 제작 규칙]
초등 4~6학년 학생들의 독서 역량과 상상력을 키우는 세 가지 차원의 질문이어야 합니다:
1. 사실 확인 (type: "fact", categoryTitle: "사실 확인")
   - 책 속 해당 장면에서 실제로 일어난 사실, 사건의 순서, 인물의 행동이나 배경을 되짚어보는 질문입니다.
   - 조건: 반드시 '한 문장'이어야 합니다.
   - 조건: 쉬운 단어를 사용합니다.
   - 조건: 절대로 질문 안에 답을 미리 알려주지 마세요! 답을 유도하거나 가르치려 하지 말고 질문만 하세요.
   - hint: 카드를 뒤집었을 때 보일 '생각을 돕는 힌트'입니다. 장면 속 특정 단서나 책을 다시 찾아볼 수 있는 팁을 1~2문장의 친절한 어투로 적어주세요.
   - thinkingPrompt: 학생이 자신의 생각을 시작하기 좋은 문장 첫머리 (예: "그 장면을 떠올려 보면...")

2. 인물 마음 추측 (type: "feeling", categoryTitle: "인물 마음 추측")
   - 그 장면에서 등장인물이 느꼈을 감정(기쁨, 슬픔, 억울함, 긴장감, 후회 등)이나 인물이 그렇게 행동한 까닭을 상상해 보게 하는 질문입니다.
   - 조건: 반드시 '한 문장'이어야 합니다.
   - 조건: 쉬운 단어를 사용합니다. 답을 알려주지 말고 학생이 자유롭게 인물의 마음에 공감해보도록 질문만 하세요.
   - hint: "인물의 표정이나 그때 했던 말, 처했던 상황을 생각해보면 어떤 마음이었는지 짐작할 수 있어요."와 같이 생각을 돕는 팁 1~2문장.
   - thinkingPrompt: 학생의 생각 시작 문장 (예: "인물의 마음은 분명...")

3. 나와 연결하기 (type: "connect", categoryTitle: "나와 연결하기")
   - 책 속 상황이나 인물의 고민을 '나 자신의 경험, 우리 생활, 나의 가치관'과 연결해 보는 질문입니다.
   - 조건: 반드시 '한 문장'이어야 합니다.
   - 조건: 쉬운 단어를 사용합니다. 정답이 없는 열린 질문이어야 합니다. (예: "만약 나라면...", "나에게도 비슷한 일이 일어났다면...")
   - hint: "내 학교생활이나 친구들과의 경험 속에서 비슷한 순간이 있었는지 떠올려 보세요."와 같이 편안하게 자신을 돌아보게 하는 힌트 1~2문장.
   - thinkingPrompt: 학생의 생각 시작 문장 (예: "만약 나에게 이런 일이 생긴다면...")

[문체와 말투]
- 초등학생에게 말하듯 친절하고 다정한 높임말 존댓말(~했을까요?, ~일까요?, ~해보세요)을 사용하세요.
- 어려운 한자어나 교과서적인 딱딱한 어투 대신 일상적이고 친숙한 단어를 쓰세요.
`.trim();

    const prompt = `[학생이 입력한 내용]
책 제목: ${trimmedTitle}
인상 깊은 장면: ${trimmedScene}`;

    let response;
    let attempts = 0;
    while (attempts < 2) {
      try {
        attempts++;
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isAppropriate: {
                  type: Type.BOOLEAN,
                  description: '입력 내용이 적절한지 여부 (부적절/장난/비속어인 경우 false)',
                },
                rejectionReason: {
                  type: Type.STRING,
                  description: '부적절한 경우 정중하고 따뜻하게 다시 작성을 부탁하는 안내문',
                },
                bookTitle: {
                  type: Type.STRING,
                  description: '정리된 책 제목',
                },
                cards: {
                  type: Type.ARRAY,
                  description: '질문 카드 3장 (사실 확인 1개, 인물 마음 추측 1개, 나와 연결하기 1개)',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: {
                        type: Type.STRING,
                        description: '카드 유형 ("fact" | "feeling" | "connect")',
                      },
                      categoryTitle: {
                        type: Type.STRING,
                        description: '카드 카테고리 제목 ("사실 확인" | "인물 마음 추측" | "나와 연결하기")',
                      },
                      question: {
                        type: Type.STRING,
                        description: '한 문장의 명확하고 쉬운 질문 (답을 알려주지 말고 오직 질문만)',
                      },
                      hint: {
                        type: Type.STRING,
                        description: '카드를 뒤집으면 보이는 생각을 돕는 친절한 힌트 (1~2문장)',
                      },
                      thinkingPrompt: {
                        type: Type.STRING,
                        description: '학생이 생각을 적기 시작할 때 힌트가 되는 문장 시작 어구',
                      },
                    },
                    required: ['type', 'categoryTitle', 'question', 'hint', 'thinkingPrompt'],
                  },
                },
              },
              required: ['isAppropriate', 'cards'],
            },
          },
        });
        break;
      } catch (err: any) {
        if (attempts >= 2) throw err;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!response || !response.text) {
      throw new Error('Gemini API 반환값이 비어 있습니다.');
    }

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (error: any) {
    console.error('Error generating question cards:', error);
    res.status(500).json({
      isAppropriate: false,
      rejectionReason: '질문 카드를 만드는 중에 작은 문제가 생겼어요. 잠시 후 다시 시도해 줄래? 😊',
      error: error?.message || 'Unknown error',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
