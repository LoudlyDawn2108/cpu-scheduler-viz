import { Trash2 } from 'lucide-react';
import type { Process } from './types';

interface ProcessListProps {
  processes: Process[];
  onDeleteProcess: (id: number) => void;
}

export const ProcessList = ({ processes, onDeleteProcess }: ProcessListProps) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh Sách Tiến Trình</h2>
      <div className="space-y-2">
        {processes.map((process) => (
          <div key={process.id} className="flex items-center justify-between bg-gray-50 p-4 rounded border border-gray-200">
            <div className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: process.color }}
              />
              <span className="text-gray-900 font-medium">{process.name}</span>
              <span className="text-gray-600">Đến: {process.arrivalTime}</span>
              <span className="text-gray-600">Xử lý: {process.burstTime}</span>
              <span className="text-gray-600">Còn lại: {process.remainingTime}</span>
            </div>
            <button
              onClick={() => onDeleteProcess(process.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
