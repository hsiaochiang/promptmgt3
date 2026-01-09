import { useEffect } from 'react';
import { Sidebar } from './layout/Sidebar';
import { MainContent } from './layout/MainContent';
import { SidePanel } from './layout/SidePanel';
import { useUiStore } from './state/uiStore';

export default function App() {
  const { activeSection, selectedItem, closePanel, initFromBackend } = useUiStore();

  useEffect(() => {
    initFromBackend();
  }, [initFromBackend]);

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 selection:bg-[#CDE8F0] relative">
      <Sidebar />
      <MainContent activeSection={activeSection} />
      {selectedItem && (
        <>
          <div className="absolute inset-0 bg-black/10 z-40" onClick={closePanel}></div>
          <SidePanel />
        </>
      )}
    </div>
  );
}
