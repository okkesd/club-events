import { RefreshCw, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  // Renamed from 'onRetry' to 'retry' to match your EventCalendar usage
  retry: () => void;
}

export function ErrorState({ message, retry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center h-full bg-gray-50/50 dark:bg-gray-900/50 vibrant:bg-purple-50/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 vibrant:border-purple-300 transition-colors">
      
      {/* Icon Background: Light Red -> Dark Transparent Red */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-4 animate-in zoom-in-50 duration-300">
        <WifiOff className="w-8 h-8 text-red-500 dark:text-red-400" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Whoops! The servers tripped.
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-sm leading-relaxed">
        {/* Fallback to humor if the backend error is generic, otherwise show specific error */}
        {message === "Failed to connect server!" 
          ? "Our server hamsters decided to take a coffee break. We're trying to bribe them back to work." 
          : `Something went wrong: ${message}`}
      </p>

      <button
        onClick={retry}
        className="
            inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer border shadow-sm
            bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-md
            dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-blue-400 dark:hover:border-blue-500
        "
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}