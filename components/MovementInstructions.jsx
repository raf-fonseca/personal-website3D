"use client";

export default function MovementInstructions({ isVisible = true }) {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-gray-700">Movement:</span>
          <div className="flex gap-2">
            <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              W
            </kbd>
            <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              A
            </kbd>
            <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              S
            </kbd>
            <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              D
            </kbd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-gray-700">
            Up / Down:
          </span>
          <div className="flex gap-2">
            <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              Space
            </kbd>
            <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              Shift
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
