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
  const isRunningRef = useRef(false);
  const tickRef = useRef<() => Promise<void>>(async () => {});
  const speedRef = useRef(speed);

  const delay = useCallback(async () => {
    return new Promise<void>(resolve => setTimeout(() => resolve(), speed));
  }, [speed]);

  const reset = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setCurrentTime(0);
    setCurrentProcess(null);
    setReadyQueue([]);
    setCompletedProcesses([]);
    setExecutionHistory([]);
    setTotalExecutionTime(0);
    setProcesses(processes.map(p => ({ ...p, remainingTime: p.burstTime })));
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
  const tick = useCallback(async () => {
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

    setReadyQueue(updatedReadyQueue);
    await delay(); // Small delay for UI update

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
          setCurrentProcess(newCurrentProcess);
          setReadyQueue(updatedReadyQueue);
          await delay(); // Small delay for UI update
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
        setCurrentProcess(newCurrentProcess);
        setExecutionHistory(newExecutionHistory);
        setCompletedProcesses(newCompletedProcesses);
        setProcesses(updatedProcesses);
        setCurrentTime(time + 1);
        await delay();
        
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
            setCurrentProcess(newCurrentProcess);
            setExecutionHistory(newExecutionHistory);
            setCompletedProcesses(newCompletedProcesses);
            setProcesses(updatedProcesses);
            setCurrentTime(time + 1);
            await delay(); // Small delay for UI update
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
          setCurrentProcess(newCurrentProcess);
          setReadyQueue(updatedReadyQueue);
          await delay(); // Small delay for UI update
        }
      }
      
      if (!newCurrentProcess && updatedReadyQueue.length > 0) {
        updatedReadyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        const newProcess = updatedReadyQueue.shift()!;
        nextProcess = { ...newProcess, startTime: time };
        newCurrentProcess = nextProcess;
        setCurrentProcess(newCurrentProcess);
        setReadyQueue(updatedReadyQueue);
        await delay(); // Small delay for UI update
      }
      
      if (nextProcess) {
        // Record execution
        newExecutionHistory.push({ time, process: nextProcess });
        
        // Decrease remaining time
        const updated = { ...nextProcess, remainingTime: nextProcess.remainingTime - 1 };
        setCurrentProcess(updated);
        setExecutionHistory(newExecutionHistory);
        setCompletedProcesses(newCompletedProcesses);
        setProcesses(updatedProcesses);
        setCurrentTime(time + 1);
        await delay(); // Small delay for UI update
        
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
            setCurrentProcess(newCurrentProcess);
            setExecutionHistory(newExecutionHistory);
            setCompletedProcesses(newCompletedProcesses);
            setProcesses(updatedProcesses);
            setCurrentTime(time + 1);
            await delay(); // Small delay for UI update
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

    // Check for newly arrived processes
    const newlyArrivedafter = processes.filter(p => p.arrivalTime === time + 1);
    const updatedReadyQueueafter = [...updatedReadyQueue];
    
    newlyArrivedafter.forEach(p => {
      if (!completedProcesses.find(cp => cp.id === p.id) && 
          !updatedReadyQueueafter.find(rp => rp.id === p.id) &&
          (!currentProcess || currentProcess.id !== p.id)) {
        updatedReadyQueueafter.push({ ...p });
      }
    });

    setReadyQueue(updatedReadyQueueafter);
    // Check if simulation is finished
    if (newCompletedProcesses.length === processes.length) {
      setIsRunning(false);
      isRunningRef.current = false;
    }
  }, [currentTime, processes, readyQueue, currentProcess, completedProcesses, executionHistory, algorithm, delay]);

  // Store the latest tick function in ref
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // Store the latest speed in ref
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

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

  // Animation loop using recursive setTimeout to handle async tick
  useEffect(() => {
    // Always sync the ref with the state first
    isRunningRef.current = isRunning;
    
    if (isRunning) {
      // Clear any existing timeout to prevent multiple loops
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }

      // Start the async loop
      const runTick = async () => {
        if (!isRunningRef.current) return; // Check ref, not state
        
        await tickRef.current(); // Use ref to get latest tick function
        
        // Schedule next tick only after current one completes
        if (isRunningRef.current) {
          intervalRef.current = setTimeout(runTick, speedRef.current) as unknown as number;
        }
      };
      
      // Start the first tick with a small delay to ensure state is settled
      intervalRef.current = setTimeout(runTick, 0) as unknown as number;
    } else {
      // Stop immediately
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      // Cleanup: stop the loop if component unmounts or effect re-runs
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]); // Removed speed from dependencies - using speedRef instead

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
