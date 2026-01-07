import React, { useState } from 'react';
import { Prompt, WOSPrefix } from './types';
// @ts-ignore
import { savePrompt } from './services/api';
// @ts-ignore
import { formatWOSTag } from './utils/tagHelper';

const App: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = async () => {
    const promptData: Prompt = {
      title,
      body,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      projectId: 'default', // Placeholder as projectId is mandatory
      sourceUrl: window.location.href,
    };

    try {
      await savePrompt(promptData);
      console.log('Prompt saved successfully');
    } catch (error) {
      console.error('Failed to save prompt', error);
    }
  };

  const handleLevelClick = (prefix: WOSPrefix) => {
    // Assuming formatWOSTag returns a string tag based on the prefix
    const newTag = formatWOSTag ? formatWOSTag(prefix) : prefix;
    setTags((prev) => (prev ? `${prev}, ${newTag}` : newTag));
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', boxSizing: 'border-box' }}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: '8px', fontSize: '16px', width: '100%', boxSizing: 'border-box' }}
      />

      <textarea
        placeholder="Content"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        style={{ padding: '8px', fontSize: '14px', flex: 1, resize: 'none', width: '100%', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
        <button onClick={() => handleLevelClick(WOSPrefix.Intent)} style={{ flex: 1, padding: '6px' }}>
          L1 (Intent)
        </button>
        <button onClick={() => handleLevelClick(WOSPrefix.Structure)} style={{ flex: 1, padding: '6px' }}>
          L2 (Structure)
        </button>
        <button onClick={() => handleLevelClick(WOSPrefix.Project)} style={{ flex: 1, padding: '6px' }}>
          L3 (Project)
        </button>
      </div>

      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
      />

      <button
        onClick={handleSave}
        style={{ padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
      >
        Save
      </button>
    </div>
  );
};

export default App;