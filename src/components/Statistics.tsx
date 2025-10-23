import type { CompletedProcess } from './types';

interface StatisticsProps {
  completedProcesses: CompletedProcess[];
}

export const Statistics = ({ completedProcesses }: StatisticsProps) => {
  const avgWaitingTime = completedProcesses.length > 0
    ? (completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0) / completedProcesses.length).toFixed(2)
    : 0;

  const avgTurnaroundTime = completedProcesses.length > 0
    ? (completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0) / completedProcesses.length).toFixed(2)
    : 0;

  if (completedProcesses.length === 0) return null;

  // Sort by process ID for display
  const sortedProcesses = [...completedProcesses].sort((a, b) => a.id - b.id);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Bảng tiến trình</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-300">Mã</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-300">Đến</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-300">Xử lý</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-300">Hoàn thành</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-300">Quay vòng</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-300">Chờ</th>
            </tr>
          </thead>
          <tbody>
            {sortedProcesses.map((process) => (
              <tr key={process.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-center text-gray-900 border-b border-gray-300">{process.name}</td>
                <td className="px-4 py-3 text-center text-gray-700 border-b border-gray-300">{process.arrivalTime}</td>
                <td className="px-4 py-3 text-center text-gray-700 border-b border-gray-300">{process.burstTime}</td>
                <td className="px-4 py-3 text-center text-gray-700 border-b border-gray-300">{process.completionTime}</td>
                <td className="px-4 py-3 text-center text-gray-700 border-b border-gray-300">{process.turnaroundTime}</td>
                <td className="px-4 py-3 text-center text-gray-700 border-b border-gray-300">{process.waitingTime}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-bold">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right text-gray-900">Trung bình</td>
              <td className="px-4 py-3 text-center text-gray-900">{avgTurnaroundTime}</td>
              <td className="px-4 py-3 text-center text-gray-900">{avgWaitingTime}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
