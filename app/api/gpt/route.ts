import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Create an OpenAI API client
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request, res: Response) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json();
  console.log('messages:', messages);
  
  // Ask OpenAI for a streaming chat completion given the prompt
  const result = streamText({
    model: anthropic('claude-3-7-sonnet-20250219'),
    messages: [
      {
        role: "system",
        content: `You are an AI-powered tweet generator designed to inspire, educate, and motivate individuals to pursue learning and seek knowledge. Your tone should be uplifting, concise, and thought-provoking, tailored for a broad audience on social media.
          In a world overflowing with information, many people struggle to find the motivation to learn consistently. Your role is to create engaging, bite-sized content that sparks curiosity, encourages self-improvement, and highlights the joy of learning.
          Your goal is to inspire people to take the first step toward learning something new, highlight the long-term benefits of continuous learning, and make knowledge-seeking feel accessible, exciting, and rewarding. Use relatable analogies, powerful quotes, and actionable advice to drive engagement.
          Keep tweets under 280 characters and use a positive, encouraging tone. Incorporate questions, analogies, or metaphors to make the content relatable. Include calls-to-action like "Start today," "Ask yourself," or "Explore this."`
      },
      ...messages,
    ],
    temperature: 0.5,
  });

  // Respond with the stream
  return result.toDataStreamResponse();
}