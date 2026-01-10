import { useState, useEffect } from 'react';
import { savePrompt } from './services/api';
import './index.css';

function App() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  // 初始化時，自動偵測是否要擷取
  useEffect(() => {
    // 這裡可以做一些初始化檢查
  }, []);

  // 核心戰術：智慧擷取
  const handleClip = async () => {
    try {
      // 1. 獲取當前分頁資訊
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      // 2. 設定標題與網址
      const pageTitle = tab.title || '';
      const pageUrl = tab.url || '';

      setTitle(pageTitle);
      setCurrentUrl(pageUrl);

      // 3. 嘗試抓取使用者反白的文字 (Selection)
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || ''
      });

      const selection = result[0]?.result;

      // 4. 組合內容：如果有選取文字就用選取的，否則只留網址
      if (selection && selection.trim()) {
        setBody(`${selection}\n\nSource: ${pageUrl}`);
      } else {
        setBody(`Source: ${pageUrl}`);
      }

      // 自動幫忙加上 source 標籤
      if (!tags.includes('source:web')) {
        setTags(prev => prev ? `${prev}, source:web` : 'source:web');
      }

    } catch (err) {
      console.error('Clip failed:', err);
      setErrorMessage('無法讀取頁面資訊，請確認權限。');
    }
  };

  const handleSave = async () => {
    if (!title) {
      setErrorMessage('標題為必填項目');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      // 處理標籤字串轉陣列
      const tagList = tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);

      await savePrompt({
        title,
        body,
        tags: tagList,
        sourceUrl: currentUrl
      });

      setStatus('success');

      // 成功後清空，但保留成功訊息一下下
      setTimeout(() => {
        setTitle('');
        setBody('');
        setTags('');
        setStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Save failed:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '存檔失敗');
    }
  };

  return (
    <div className="w-[400px] bg-slate-50 min-h-[500px] flex flex-col font-sans text-slate-800">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold tracking-wide">WOS Capture</h1>
        <div className="flex gap-2">
          {/* 戰術按鈕：智慧擷取 */}
          <button
            onClick={handleClip}
            className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 text-xs font-bold rounded transition-colors flex items-center gap-1"
            title="自動抓取網頁標題與選取文字"
          >
            <span>⚡ Clip Page</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col gap-4">

        {/* Status Messages */}
        {status === 'success' && (
          <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm font-medium animate-pulse">
            ✓ 資料已傳輸至中樞 (Saved to Inbox)
          </div>
        )}

        {(status === 'error' || errorMessage) && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
            ⚠ {errorMessage}
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="輸入標題或是點擊 Clip Page..."
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="space-y-1 flex-1 flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase">Content / Selection</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="輸入內容，或反白網頁文字後點擊 Clip Page..."
            className="w-full flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例如: ai, prompt, idea (逗號分隔)"
            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

      </div>

      {/* Footer / Action */}
      <div className="p-4 bg-white border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={status === 'loading'}
          className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transform active:scale-95 transition-all
            ${status === 'loading'
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 hover:shadow-xl'
            }`}
        >
          {status === 'loading' ? 'TRANSMITTING...' : 'SAVE TO INBOX'}
        </button>
      </div>
    </div>
  );
}

export default App;