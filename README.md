# CPU Scheduler Components

This directory contains modular components for the CPU Scheduling Visualizer.

## Component Structure

### Core Components

- **`cpu-scheduler-viz.tsx`** - Main component that orchestrates all sub-components
- **`useScheduler.ts`** - Custom hook that manages all scheduling logic and state
- **`types.ts`** - TypeScript type definitions

### UI Components

#### `AlgorithmSelector.tsx`
Allows users to switch between SJF (Shortest Job First) and SRTN (Shortest Remaining Time Next) algorithms.

**Props:**
- `algorithm: string` - Current selected algorithm
- `onAlgorithmChange: (algorithm: string) => void` - Callback when algorithm changes

#### `ProcessForm.tsx`
Form for adding new processes to the scheduler.

**Props:**
- `processes: Process[]` - Current list of processes
- `onAddProcess: (process: Omit<Process, 'id'>) => void` - Callback to add a process
- `colors: string[]` - Available colors for processes

#### `ProcessList.tsx`
Displays the list of all processes with their properties.

**Props:**
- `processes: Process[]` - List of processes
- `onDeleteProcess: (id: number) => void` - Callback to delete a process

#### `Controls.tsx`
Start/Pause/Reset buttons and speed control slider.

**Props:**
- `isRunning: boolean` - Whether the simulation is running
- `currentTime: number` - Current time unit
- `speed: number` - Speed in milliseconds per time unit
- `onToggleRunning: () => void` - Callback to toggle running state
- `onReset: () => void` - Callback to reset simulation
- `onSpeedChange: (speed: number) => void` - Callback to change speed

#### `GanttChart.tsx`
Visual timeline showing process execution with individual time slices.

**Props:**
- `processes: Process[]` - List of processes
- `currentTime: number` - Current time unit
- `currentProcess: RunningProcess | null` - Currently executing process
- `executionHistory: ExecutionHistoryEntry[]` - History of process execution
- `isRunning: boolean` - Whether the simulation is running

#### `ReadyQueue.tsx`
Displays processes waiting in the ready queue.

**Props:**
- `readyQueue: Process[]` - Processes in the ready queue
- `algorithm: string` - Current algorithm (affects display)

#### `CompletedProcesses.tsx`
Shows completed processes with their completion time, turnaround time, and waiting time.

**Props:**
- `completedProcesses: CompletedProcess[]` - List of completed processes

#### `Statistics.tsx`
Displays average waiting time and average turnaround time statistics.

**Props:**
- `completedProcesses: CompletedProcess[]` - List of completed processes for calculation

## Custom Hook: `useScheduler`

The `useScheduler` hook encapsulates all scheduling logic:

**Parameters:**
- `initialProcesses: Process[]` - Initial set of processes

**Returns:**
```typescript
{
  processes: Process[]
  setProcesses: (processes: Process[]) => void
  algorithm: string
  handleAlgorithmChange: (algorithm: string) => void
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  currentTime: number
  currentProcess: RunningProcess | null
  readyQueue: Process[]
  completedProcesses: CompletedProcess[]
  executionHistory: ExecutionHistoryEntry[]
  speed: number
  setSpeed: (speed: number) => void
  reset: () => void
}
```

## Type Definitions

### `Process`
```typescript
{
  id: number
  name: string
  arrivalTime: number
  burstTime: number
  remainingTime: number
  color: string
}
```

### `RunningProcess`
Extends `Process` with:
```typescript
{
  startTime: number
}
```

### `CompletedProcess`
Extends `Process` with:
```typescript
{
  completionTime: number
  turnaroundTime: number
  waitingTime: number
}
```

### `ExecutionHistoryEntry`
```typescript
{
  time: number
  process: Process
}
```

## Benefits of This Architecture

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other contexts
3. **Testability** - Smaller components are easier to test
4. **Maintainability** - Changes to one component don't affect others
5. **Type Safety** - Centralized type definitions ensure consistency
6. **Logic Separation** - Business logic is in the hook, UI is in components
