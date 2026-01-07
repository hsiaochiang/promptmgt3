import { Prompt, CreatePromptPayload } from '../types';

// 確保這裡是 export const，配合 App.tsx 的 import { savePrompt }
export const savePrompt = async (payload: CreatePromptPayload): Promise<void> => {
  try {
    const response = await fetch('http://localhost:3000/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to save prompt:', error);
    throw error;
  }
};