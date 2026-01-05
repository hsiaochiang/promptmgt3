export function InboxView() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">暫存區</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-sm text-yellow-800">
            💡 <strong>注意：</strong>暫存區項目的歸檔功能由外部工具處理。
            此處僅提供簡單的編輯與整理功能。
          </p>
        </div>
        <div className="text-center text-secondary py-12">
          暫存區功能開發中...
        </div>
      </div>
    </div>
  );
}
