import { useState, useEffect, useRef, useCallback } from 'react';
import type { Process, RunningProcess, CompletedProcess, ExecutionHistoryEntry } from './types';

export const useScheduler = (initialProcesses: Process[]) => {
  const [processes, setProcesses] = useState<Process[]>(initialProcesses);
  const [algorithm, setAlgorithm] = useState('SJF');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentProcess, setCurrentProcess] = useState<RunningProcess | null>(null);
  const [readyQueue, setReadyQueue] = useState<Process[]>([]);
  const [completedProcesses, setCompletedProcesses] = useState<CompletedProcess[]>([]);
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryEntry[]>([]);
  const [speed, setSpeed] = useState(2000);
  const [totalExecutionTime, setTotalExecutionTime] = useState(0);
  
  const intervalRef = useRef<number | null>(null);
  const lastPreviewTimeRef = useRef<number>(-1);

  const reset = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setCurrentProcess(null);
    setReadyQueue([]);
    setCompletedProcesses([]);
    setExecutionHistory([]);
    setTotalExecutionTime(0);
    setProcesses(processes.map(p => ({ ...p, remainingTime: p.burstTime })));
    lastPreviewTimeRef.current = -1;
  };

  const handleAlgorithmChange = (newAlgorithm: string) => {
    setAlgorithm(newAlgorithm);
    reset();
  };

  // Calculate total execution time by simulating the entire schedule
  const calculateTotalExecutionTime = useCallback(() => {
    const processesCopy = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    let time = 0;
    let currentProc: Process | null = null;
    const queue: Process[] = [];
    const completed: number[] = [];

    while (completed.length < processesCopy.length) {
      // Add newly arrived processes
      const newlyArrived = processesCopy.filter(p => 
        p.arrivalTime === time && 
        !completed.includes(p.id) && 
        !queue.find(q => q.id === p.id) &&
        (!currentProc || currentProc.id !== p.id)
      );
      queue.push(...newlyArrived);

      if (algorithm === 'SJF') {
        // Non-preemptive SJF
        if (!currentProc && queue.length > 0) {
          queue.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
          currentProc = queue.shift()!;
        }

        if (currentProc) {
          currentProc.remainingTime--;
          if (currentProc.remainingTime === 0) {
            completed.push(currentProc.id);
            currentProc = null;
          }
        }
      } else {
        // SRTN (Preemptive)
        if (queue.length > 0) {
          queue.sort((a, b) => a.remainingTime - b.remainingTime);
          if (currentProc && queue[0].remainingTime < currentProc.remainingTime) {
            queue.push(currentProc);
            queue.sort((a, b) => a.remainingTime - b.remainingTime);
            currentProc = queue.shift()!;
          }
        }

        if (!currentProc && queue.length > 0) {
          queue.sort((a, b) => a.remainingTime - b.remainingTime);
          currentProc = queue.shift()!;
        }

        if (currentProc) {
          currentProc.remainingTime--;
          if (currentProc.remainingTime === 0) {
            completed.push(currentProc.id);
            currentProc = null;
          }
        }
      }

      time++;
      
      // Safety check to prevent infinite loop
      if (time > 10000) break;
    }

    return time;
  }, [processes, algorithm]);

  // Simulation tick function that runs the scheduling logic and increments time
  const tick = useCallback(() => {
    const time = currentTime;
    
    // Check for newly arrived processes
    const newlyArrived = processes.filter(p => p.arrivalTime === time);
    const updatedReadyQueue = [...readyQueue];
    
    newlyArrived.forEach(p => {
      if (!completedProcesses.find(cp => cp.id === p.id) && 
          !updatedReadyQueue.find(rp => rp.id === p.id) &&
          (!currentProcess || currentProcess.id !== p.id)) {
        updatedReadyQueue.push({ ...p });
      }
    });

    let newCurrentProcess = currentProcess;
    const newExecutionHistory = [...executionHistory];
    const newCompletedProcesses = [...completedProcesses];
    let updatedProcesses = [...processes];

    if (algorithm === 'SJF') {
      // Non-preemptive SJF
      if (!newCurrentProcess) {
        if (updatedReadyQueue.length > 0) {
          // Sort by burst time, then by arrival time
          updatedReadyQueue.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
          const nextProcess = updatedReadyQueue.shift()!;
          newCurrentProcess = { ...nextProcess, startTime: time };
        } else {
          // CPU is idle
          newExecutionHistory.push({ time, process: null });
        }
      }

      if (newCurrentProcess) {
        // Record execution
        newExecutionHistory.push({ time, process: newCurrentProcess });
        
        // Calculate remaining time
        const executedTime = time - newCurrentProcess.startTime + 1;
        const remaining = newCurrentProcess.burstTime - executedTime;
        
        // Update remaining time for display
        const updatedProcess = { ...newCurrentProcess, remainingTime: remaining };
        newCurrentProcess = updatedProcess;
        
        // Check if process completes at the END of this time unit
        if (remaining <= 0) {
          const completionTime = time + 1;
          const completed: CompletedProcess = {
            ...newCurrentProcess,
            remainingTime: 0,
            completionTime,
            turnaroundTime: completionTime - newCurrentProcess.arrivalTime,
            waitingTime: completionTime - newCurrentProcess.arrivalTime - newCurrentProcess.burstTime
          };
          newCompletedProcesses.push(completed);
          
          // Update the process in the list
          updatedProcesses = updatedProcesses.map(p => 
            p.id === completed.id ? { ...p, remainingTime: 0 } : p
          );
          
          // Immediately assign next process from queue if available
          if (updatedReadyQueue.length > 0) {
            updatedReadyQueue.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
            const nextProcess = updatedReadyQueue.shift()!;
            newCurrentProcess = { ...nextProcess, startTime: time + 1 };
          } else {
            newCurrentProcess = null;
          }
        } else {
          updatedProcesses = updatedProcesses.map(p => 
            p.id === updatedProcess.id ? updatedProcess : p
          );
        }
      }
    } else {
      // SRTN (Preemptive)
      let nextProcess = newCurrentProcess;
      
      // Check for preemption
      if (updatedReadyQueue.length > 0) {
        updatedReadyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        const shortestInQueue = updatedReadyQueue[0];
        
        if (newCurrentProcess && shortestInQueue.remainingTime < newCurrentProcess.remainingTime) {
          // Preempt current process
          updatedReadyQueue.push(newCurrentProcess);
          updatedReadyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
          const preemptedProcess = updatedReadyQueue.shift()!;
          nextProcess = { ...preemptedProcess, startTime: time };
          newCurrentProcess = nextProcess;
        }
      }
      
      if (!newCurrentProcess && updatedReadyQueue.length > 0) {
        updatedReadyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        const newProcess = updatedReadyQueue.shift()!;
        nextProcess = { ...newProcess, startTime: time };
        newCurrentProcess = nextProcess;
      }
      
      if (nextProcess) {
        // Record execution
        newExecutionHistory.push({ time, process: nextProcess });
        
        // Decrease remaining time
        const updated = { ...nextProcess, remainingTime: nextProcess.remainingTime - 1 };
        
        if (updated.remainingTime === 0) {
          const completionTime = time + 1;
          const completed: CompletedProcess = {
            ...updated,
            remainingTime: 0,
            completionTime,
            turnaroundTime: completionTime - updated.arrivalTime,
            waitingTime: completionTime - updated.arrivalTime - updated.burstTime
          };
          newCompletedProcesses.push(completed);
          
          updatedProcesses = updatedProcesses.map(p => 
            p.id === updated.id ? { ...p, remainingTime: 0 } : p
          );
          
          // Immediately assign next process from queue if available
          if (updatedReadyQueue.length > 0) {
            updatedReadyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
            const nextProcess = updatedReadyQueue.shift()!;
            newCurrentProcess = { ...nextProcess, startTime: time + 1 };
          } else {
            newCurrentProcess = null;
          }
        } else {
          newCurrentProcess = updated;
          updatedProcesses = updatedProcesses.map(p => 
            p.id === updated.id ? updated : p
          );
        }
      } else {
        // CPU is idle
        newCurrentProcess = null;
        newExecutionHistory.push({ time, process: null });
        
      }
    }

    // Update all state after simulation step
    setReadyQueue(updatedReadyQueue);
    setCurrentProcess(newCurrentProcess);
    setExecutionHistory(newExecutionHistory);
    setCompletedProcesses(newCompletedProcesses);
    setProcesses(updatedProcesses);
    setCurrentTime(time + 1);

    // Check if simulation is finished
    if (newCompletedProcesses.length === processes.length) {
      setIsRunning(false);
    }
  }, [currentTime, processes, readyQueue, currentProcess, completedProcesses, executionHistory, algorithm]);

  // Calculate total execution time when starting from the beginning
  useEffect(() => {
    if (isRunning && currentTime === 0 && executionHistory.length === 0) {
      const totalTime = calculateTotalExecutionTime();
      setTotalExecutionTime(totalTime);
    }
  }, [isRunning, currentTime, executionHistory.length, calculateTotalExecutionTime]);

  // Initialize ready queue with processes arriving at time 0
  useEffect(() => {
    if (currentTime === 0 && isRunning && executionHistory.length === 0) {
      const processesAtTimeZero = processes.filter(p => p.arrivalTime === 0);
      if (processesAtTimeZero.length > 0) {
        setReadyQueue(processesAtTimeZero.map(p => ({ ...p })));
      }
    }
  }, [currentTime, processes, isRunning, executionHistory.length]);

  // Animation loop using setInterval
  useEffect(() => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Preview arriving processes for current time if not done yet
      if (lastPreviewTimeRef.current !== currentTime) {
        const arrivingProcesses = processes.filter(p => p.arrivalTime === currentTime);
        if (arrivingProcesses.length > 0) {
          setReadyQueue(prev => {
            const updated = [...prev];
            arrivingProcesses.forEach(p => {
              if (!completedProcesses.find(cp => cp.id === p.id) && 
                  !updated.find(rp => rp.id === p.id) &&
                  (!currentProcess || currentProcess.id !== p.id)) {
                updated.push({ ...p });
              }
            });
            return updated;
          });
        }
        lastPreviewTimeRef.current = currentTime;
      }

      intervalRef.current = setInterval(() => {
        tick();
      }, speed) as unknown as number;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, speed, currentTime, algorithm, processes, readyQueue, currentProcess, completedProcesses, executionHistory, tick]);

  return {
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
  };
};
