interface AlgorithmSelectorProps {
  algorithm: string;
  onAlgorithmChange: (algorithm: string) => void;
}

export const AlgorithmSelector = ({ algorithm, onAlgorithmChange }: AlgorithmSelectorProps) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Thuật Toán</h2>
      <div className="flex gap-4">
        <button
          onClick={() => onAlgorithmChange('SJF')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            algorithm === 'SJF'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Shortest Job First
        </button>
        <button
          onClick={() => onAlgorithmChange('SRTN')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            algorithm === 'SRTN'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Shortest Remaining Time Next
        </button>
      </div>
    </div>
  );
};
