import { useState } from 'react';

export function TestToast() {
  const [show, setShow] = useState(false);

  const showToast = () => {
    console.log("🧪 Showing test toast");
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 3000);
  };

  return (
    <>
      <button
        onClick={showToast}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Direct Toast
      </button>
      
      {show && (
        <div
          className="fixed top-4 right-4 z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px]"
          style={{ position: 'fixed', zIndex: 9999 }}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">ทดสอบ Toast</h3>
              <p className="text-sm text-gray-600 mt-1">นี่คือการทดสอบ Toast แบบ Direct</p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
