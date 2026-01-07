import { CreatePromptPayload } from '../types';

// 我們保留函式名稱 savePrompt 以免 App.tsx 報錯，但實際行為改為存入 Inbox
export const savePrompt = async (payload: CreatePromptPayload): Promise<void> => {
  try {
    // 轉換 Payload 格式以符合 Inbox API 需求
    // Extension (title, content, tags) -> Inbox (title, rawContent, suggestedTags)
    const inboxPayload = {
      title: payload.title,
      rawContent: payload.body || '', // 把內容對應到 rawContent
      sourcePlatform: 'browser-extension', // 標記來源
      sourceLink: window.location.href, // 紀錄當下網址 (如果是從網頁擷取)
      suggestedTags: payload.tags || [], // 把標籤轉過去
    };

    console.log('Sending to Inbox:', inboxPayload);

    const response = await fetch('http://localhost:3001/api/inbox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inboxPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server responded with ${response.status}`);
    }
    
    console.log('Successfully saved to Inbox!');
  } catch (error) {
    console.error('Failed to save to inbox:', error);
    throw error;
  }
};