import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyBf1AvpdNOkPqkrzwKyTyKTeypkD69ohoQ' });

export const analyzeVideo = async (videoBase64, mimeType, scanType = 'deep') => {
  const ai = getAI();
  
  const prompt = scanType === 'fast'
    ? `Analyze this CCTV footage quickly. Extract the following information:
1. Total count of distinct people appearing.
2. A brief summary of the most important actions or events with timestamps. Skip minor details.
3. Any notable objects.
4. A short summary of any audio or speech.

Return the result as a JSON object matching this schema.`
    : `Analyze this CCTV footage comprehensively. Extract the following information:
1. Total count of distinct people appearing.
2. A complete, exhaustive timeline of ALL actions, events, and behaviors from the very beginning to the end of the video, with precise timestamps (e.g. "0:02: Man enters through door"). Do not skip any events.
3. Any notable objects (e.g. "Red backpack", "White SUV").
4. A full, complete transcription of ALL audio, sounds, and speech heard in the video. Do not summarize; provide the full audio context.

Return the result as a JSON object matching this schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: videoBase64, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          crowdCount: { type: Type.INTEGER },
          actions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                description: { type: Type.STRING },
                intensity: { type: Type.STRING, description: "Classify the activity: 'high' for illegal or wrong activity, 'medium' for suspicious but normal things, or 'low' for completely normal things" }
              }
            }
          },
          objects: { type: Type.ARRAY, items: { type: Type.STRING } },
          audioTranscription: { type: Type.STRING }
        },
        required: ["crowdCount", "actions", "objects", "audioTranscription"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Invalid response format from AI");
  }
};

export const chatWithVideo = async (
  videoBase64, 
  mimeType, 
  history,
  newQuestion,
  newImage
) => {
  const ai = getAI();
  
  const contents = [
    {
      parts: [
        { inlineData: { data: videoBase64, mimeType } },
        { text: "This is a CCTV recording for analysis. Use it to answer the following questions accurately." }
      ],
      role: 'user'
    },
    ...history.map(h => {
      const parts = [];
      if (h.image) {
        parts.push({ inlineData: { data: h.image.base64, mimeType: h.image.mimeType } });
      }
      parts.push({ text: h.text });
      return { role: h.role, parts };
    })
  ];

  const newParts = [];
  if (newImage) {
    newParts.push({ inlineData: { data: newImage.base64, mimeType: newImage.mimeType } });
  }
  newParts.push({ text: newQuestion });
  contents.push({ role: 'user', parts: newParts });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents
  });

  return response.text || "I'm sorry, I couldn't process that question.";
};
