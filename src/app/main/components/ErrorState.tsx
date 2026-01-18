import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center h-full bg-gray-50/50 rounded-xl border border-dashed border-gray-300">
      <div className="bg-red-50 rounded-full p-4 mb-4 animate-in zoom-in-50 duration-300">
        <WifiOff className="w-8 h-8 text-red-500" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Whoops! The servers tripped.
      </h3>
      
      <p className="text-gray-500 max-w-md mb-8 text-sm leading-relaxed">
        {/* Fallback to humor if the backend error is generic, otherwise show specific error */}
        {message === "Failed to fetch" 
          ? "Our server hamsters decided to take a coffee break. We're trying to bribe them back to work." 
          : `Something went wrong: ${message}`}
      </p>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all active:scale-95"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}