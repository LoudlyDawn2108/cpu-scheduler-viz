import type { Process } from './components/types';
import { useScheduler } from './components/useScheduler';
import { AlgorithmSelector } from './components/AlgorithmSelector';
import { ProcessForm } from './components/ProcessForm';
import { ProcessList } from './components/ProcessList';
import { Controls } from './components/Controls';
import { GanttChart } from './components/GanttChart';
import { ReadyQueue } from './components/ReadyQueue';
import { Statistics } from './components/Statistics';

const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const initialProcesses: Process[] = [
  { id: 1, name: 'P1', arrivalTime: 0, burstTime: 7, remainingTime: 7, color: '#ef4444' },
  { id: 2, name: 'P2', arrivalTime: 2, burstTime: 4, remainingTime: 4, color: '#3b82f6' },
  { id: 3, name: 'P3', arrivalTime: 4, burstTime: 1, remainingTime: 1, color: '#10b981' },
  { id: 4, name: 'P4', arrivalTime: 6, burstTime: 4, remainingTime: 4, color: '#f59e0b' },
];

const CPUScheduler = () => {
  const {
    processes,
    setProcesses,
    algorithm,
    handleAlgorithmChange,
    isRunning,
    setIsRunning,
    currentTime,
    currentProcess,
    readyQueue,
    completedProcesses,
    executionHistory,
    speed,
    setSpeed,
    reset,
    totalExecutionTime
  } = useScheduler(initialProcesses);

  const handleAddProcess = (process: Omit<Process, 'id'>) => {
    setProcesses([...processes, { ...process, id: Date.now() }]);
  };

  const handleDeleteProcess = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Nhóm 13</h1>
        <p className="text-gray-600 text-center mb-8">Công việc ngắn nhất trước (SJF) & Thời gian còn lại ngắn nhất (SRTN)</p>

        <AlgorithmSelector algorithm={algorithm} onAlgorithmChange={handleAlgorithmChange} />
        
        <ProcessForm processes={processes} onAddProcess={handleAddProcess} colors={colors} />
        
        <ProcessList processes={processes} onDeleteProcess={handleDeleteProcess} />
        
        <Controls 
          isRunning={isRunning}
          currentTime={currentTime}
          speed={speed}
          onToggleRunning={() => setIsRunning(!isRunning)}
          onReset={reset}
          onSpeedChange={setSpeed}
        />

        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Biểu Đồ Gantt</h2>
          
          <GanttChart 
            processes={processes}
            currentTime={currentTime}
            currentProcess={currentProcess}
            executionHistory={executionHistory}
            isRunning={isRunning}
            totalExecutionTime={totalExecutionTime}
          />

          <ReadyQueue readyQueue={readyQueue} algorithm={algorithm} />

        </div>

        <Statistics completedProcesses={completedProcesses} />
      </div>
    </div>
  );
};

export default CPUScheduler;