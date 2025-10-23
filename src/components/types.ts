export interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  color: string;
}

export interface RunningProcess extends Process {
  startTime: number;
}

export interface CompletedProcess extends Process {
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
}

export interface ExecutionHistoryEntry {
  time: number;
  process: Process | null;
}
