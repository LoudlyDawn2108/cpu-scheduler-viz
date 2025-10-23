import { Play, Pause, RotateCcw } from 'lucide-react';

interface ControlsProps {
  isRunning: boolean;
  currentTime: number;
  speed: number;
  onToggleRunning: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export const Controls = ({ 
  isRunning, 
  currentTime, 
  speed, 
  onToggleRunning, 
  onReset, 
  onSpeedChange 
}: ControlsProps) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onToggleRunning}
          className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
            isRunning
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isRunning ? <><Pause size={20} /> Tạm dừng</> : <><Play size={20} /> Bắt đầu</>}
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2"
        >
          <RotateCcw size={20} /> Đặt lại
        </button>
        <div className="text-gray-900 text-xl ml-auto">
          Thời gian: <span className="font-bold">{currentTime}</span>
        </div>
      </div>
      
      {/* Speed Control */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="text-gray-900 font-medium mb-2 block">
          Tốc độ: {(speed / 1000).toFixed(2)}s mỗi đơn vị thời gian
        </label>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Nhanh</span>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: '#3b82f6'
            }}
          />
          <span className="text-gray-600 text-sm">Chậm</span>
        </div>
      </div>
    </div>
  );
};
