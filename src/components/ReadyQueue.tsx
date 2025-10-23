import type { Process } from './types';

interface ReadyQueueProps {
  readyQueue: Process[];
  algorithm: string;
}

export const ReadyQueue = ({ readyQueue, algorithm }: ReadyQueueProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-700 mb-3">Hàng Đợi Sẵn Sàng</h3>
      {readyQueue.length > 0 ? (
        <div className="flex gap-3 flex-wrap">
          {readyQueue.map((process) => (
            <div
              key={process.id}
              className="bg-gray-100 p-3 rounded-lg flex items-center gap-3 min-w-[120px] border border-gray-200"
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: process.color }}
              />
              <div>
                <div className="text-gray-900 font-medium">{process.name}</div>
                <div className="text-gray-600 text-sm">
                  {algorithm === 'SJF' ? `Xử lý: ${process.burstTime}` : `Còn lại: ${process.remainingTime}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600 border border-gray-200">
          Hàng đợi trống
        </div>
      )}
    </div>
  );
};
