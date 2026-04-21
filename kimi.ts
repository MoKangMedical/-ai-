import axios from "axios";

const KIMI_API_URL = "https://api.moonshot.cn/v1";

interface KimiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface KimiChatRequest {
  model: string;
  messages: KimiMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface KimiChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call Kimi API for text processing
 */
export async function callKimiAPI(
  messages: KimiMessage[],
  temperature: number = 0.3
): Promise<string> {
  const apiKey = process.env.KIMI_API_KEY;
  
  if (!apiKey) {
    throw new Error("KIMI_API_KEY is not configured");
  }

  try {
    const response = await axios.post<KimiChatResponse>(
      `${KIMI_API_URL}/chat/completions`,
      {
        model: "moonshot-v1-8k",
        messages,
        temperature,
      } as KimiChatRequest,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60000, // 60 seconds timeout
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in Kimi API response");
    }

    return content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(`Kimi API error: ${message}`);
    }
    throw error;
  }
}

/**
 * Academic translation function
 */
export async function translateText(
  text: string,
  targetLang: "en" | "zh"
): Promise<string> {
  const systemPrompt =
    targetLang === "en"
      ? "你是一个专业的学术翻译助手。请将用户提供的中文文本翻译成地道的学术英文，保持专业性和准确性。只返回翻译结果，不要添加任何解释。"
      : "你是一个专业的学术翻译助手。请将用户提供的英文文本翻译成准确的中文，保持学术规范和专业性。只返回翻译结果，不要添加任何解释。";

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);
}

/**
 * Academic polishing function
 */
export async function polishText(text: string): Promise<string> {
  const systemPrompt =
    "你是一个专业的学术润色助手。请优化用户提供的学术文本，提升语言表达的专业性和地道性，改善句式结构和逻辑连贯性。只返回润色后的文本，不要添加任何解释。";

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);
}

/**
 * Grammar check and correction
 */
export async function checkGrammar(text: string): Promise<string> {
  const systemPrompt =
    "你是一个专业的语法校对助手。请检查并修正用户提供文本中的语法错误、拼写错误和标点符号问题。只返回修正后的文本，不要添加任何解释。";

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);
}

/**
 * Tense correction
 */
export async function correctTense(text: string): Promise<string> {
  const systemPrompt =
    "你是一个专业的时态校正助手。请检查并修正用户提供的学术文本中的时态问题，确保时态使用符合学术写作规范。只返回修正后的文本，不要添加任何解释。";

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);
}

/**
 * Convert between British and American English
 */
export async function convertEnglishVariant(
  text: string,
  variant: "british" | "american"
): Promise<string> {
  const systemPrompt =
    variant === "british"
      ? "你是一个专业的英语转换助手。请将用户提供的文本转换为英式英语，包括拼写、词汇和表达习惯。只返回转换后的文本，不要添加任何解释。"
      : "你是一个专业的英语转换助手。请将用户提供的文本转换为美式英语，包括拼写、词汇和表达习惯。只返回转换后的文本，不要添加任何解释。";

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);
}

/**
 * Optimize sentence structure
 */
export async function optimizeSentence(text: string): Promise<string> {
  const systemPrompt =
    "你是一个专业的句式优化助手。请优化用户提供文本的句式结构，使其更加清晰、简洁和专业。改善句子的多样性和表达效果。只返回优化后的文本，不要添加任何解释。";

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);
}

/**
 * Enhance logical coherence
 */
export async function enhanceCoherence(text: string): Promise<string> {
  const systemPrompt =
    "你是一个专业的逻辑连贯性助手。请增强用户提供文本的逻辑连贯性，改善句子之间的过渡和衔接，使论述更加流畅。只返回优化后的文本，不要添加任何解释。";

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);
}

/**
 * Improve paragraph structure
 */
export async function improveParagraph(text: string): Promise<string> {
  const systemPrompt =
    "你是一个专业的段落结构优化助手。请改善用户提供文本的段落结构，确保每个段落主题明确、组织合理、逻辑清晰。只返回优化后的文本，不要添加任何解释。";

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]);
}

/**
 * Intelligent continuation
 */
export async function continueWriting(
  context: string,
  instruction?: string
): Promise<string> {
  const systemPrompt =
    "你是一个专业的学术写作助手。基于用户提供的上下文，续写符合学术规范的内容。保持写作风格一致，确保逻辑连贯。只返回续写的内容，不要添加任何解释。";

  const userContent = instruction
    ? `上下文：\n${context}\n\n续写要求：${instruction}`
    : context;

  return callKimiAPI([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]);
}
