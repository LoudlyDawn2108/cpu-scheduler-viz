import type { Process, RunningProcess, ExecutionHistoryEntry } from './types';

interface GanttChartProps {
  processes: Process[];
  currentTime: number;
  currentProcess: RunningProcess | null;
  executionHistory: ExecutionHistoryEntry[];
  isRunning: boolean;
  totalExecutionTime: number;
}

export const GanttChart = ({ 
  processes, 
  currentTime, 
  currentProcess, 
  executionHistory,
  isRunning,
  totalExecutionTime
}: GanttChartProps) => {
  const maxArrivalTime = processes.length > 0 ? Math.max(...processes.map(p => p.arrivalTime)) : 0;
  const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);
  const estimatedMaxTime = maxArrivalTime + totalBurstTime;
  
  const displayLength = totalExecutionTime > 0 
    ? totalExecutionTime 
    : Math.max(currentTime, executionHistory.length, estimatedMaxTime);
  
  // Build time slots from execution history
  const timeSlots: (Process | null)[] = [];
  executionHistory.forEach(entry => {
    timeSlots[entry.time] = entry.process;
  });

  return (
    <div className="mb-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-gray-900 font-medium">Dòng thời gian thực thi</span>
            <span className="text-gray-600 text-sm">Thời gian hiện tại: {currentTime}</span>
          </div>
          <div className="relative h-16 bg-gray-200 rounded-lg overflow-hidden flex">
            {Array.from({ length: displayLength }, (_, i) => {
              const sliceProcess = timeSlots[i];
              const isExecuted = sliceProcess !== undefined;
              const isIdle = sliceProcess === null;
              const isCurrentlyExecuting = i === currentTime - 1 && sliceProcess && currentProcess && sliceProcess.id === currentProcess.id;
              
              return (
                <div
                  key={i}
                  className="h-full flex items-center justify-center text-white font-bold text-xs border-r border-gray-300 relative group"
                  style={{
                    width: `${100 / displayLength}%`,
                    backgroundColor: isIdle ? '#f3f4f6' : (isExecuted && sliceProcess ? sliceProcess.color : '#9ca3af'),
                    opacity: isCurrentlyExecuting ? 1 : 0.85,
                    color: isIdle ? '#6b7280' : 'white'
                  }}
                  title={`Thời gian ${i}: ${isIdle ? 'RẢNH' : (sliceProcess ? sliceProcess.name : 'Chưa thực thi')}`}
                >
                  {isIdle ? (
                    <span className="text-xs">RẢNH</span>
                  ) : (
                    sliceProcess && isExecuted && (i === 0 || timeSlots[i - 1]?.id !== sliceProcess.id) && displayLength <= 30 && (
                      <span className="text-xs">{sliceProcess.name}</span>
                    )
                  )}
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] opacity-0 group-hover:opacity-100 bg-black/50 py-0.5">
                    {i}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-gray-600 text-sm">
            <span>0</span>
            <span>{Math.floor(displayLength / 2)}</span>
            <span>{displayLength}</span>
          </div>
        </div>
        
        {/* Current process info */}
        {(isRunning || currentProcess) && (
          <div className="mt-4 flex items-center justify-between bg-gray-100 p-3 rounded border border-gray-200">
            {currentProcess ? (
              <>
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${isRunning ? 'animate-pulse' : ''}`} style={{ backgroundColor: currentProcess.color }} />
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium mb-1">
                      Đang chạy: {currentProcess.name}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-200" 
                        style={{ 
                          backgroundColor: currentProcess.color,
                          width: `${((currentProcess.burstTime - currentProcess.remainingTime) / currentProcess.burstTime) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-gray-700 ml-4 shrink-0">
                  {currentProcess.burstTime - currentProcess.remainingTime} / {currentProcess.burstTime}
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse" />
                  <span className="text-gray-900 font-medium">CPU: Rảnh</span>
                </div>
                <span className="text-gray-600 text-sm">
                  Đang chờ tiến trình đến...
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
