import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Process } from './types';

interface ProcessFormProps {
  processes: Process[];
  onAddProcess: (process: Omit<Process, 'id'>) => void;
  colors: string[];
}

export const ProcessForm = ({ processes, onAddProcess, colors }: ProcessFormProps) => {
  const [newProcess, setNewProcess] = useState({ name: '', arrivalTime: '', burstTime: '' });

  const handleAdd = () => {
    if (newProcess.name && newProcess.arrivalTime !== '' && parseInt(newProcess.burstTime) > 0) {
      const process = {
        name: newProcess.name,
        arrivalTime: parseInt(newProcess.arrivalTime),
        burstTime: parseInt(newProcess.burstTime),
        remainingTime: parseInt(newProcess.burstTime),
        color: colors[processes.length % colors.length]
      };
      onAddProcess(process);
      setNewProcess({ name: '', arrivalTime: '', burstTime: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Thêm Tiến Trình</h2>
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Tên (ví dụ: P5)"
          value={newProcess.name}
          onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })}
          className="px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Thời gian đến"
          value={newProcess.arrivalTime}
          onChange={(e) => setNewProcess({ ...newProcess, arrivalTime: e.target.value })}
          className="px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Thời gian xử lý"
          value={newProcess.burstTime}
          onChange={(e) => setNewProcess({ ...newProcess, burstTime: e.target.value })}
          className="px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={20} /> Thêm
        </button>
      </div>
    </div>
  );
};
