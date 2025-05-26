import { format } from 'date-fns';

// Format event time for display
export const formatEventTime = (dateString: string | Date) => {
  const date = new Date(dateString);
  return format(date, 'h:mm a');
};

// Get event color based on colorId
export const getEventColor = (colorId?: string) => {
  const colors: Record<string, string> = {
    '1': 'bg-blue-400/20 text-blue-200 border-blue-500/30',
    '2': 'bg-emerald-400/20 text-emerald-200 border-emerald-500/30',
    '3': 'bg-amber-400/20 text-amber-200 border-amber-500/30',
    '4': 'bg-rose-400/20 text-rose-200 border-rose-500/30',
    '5': 'bg-purple-400/20 text-purple-200 border-purple-500/30',
    '6': 'bg-pink-400/20 text-pink-200 border-pink-500/30',
    '7': 'bg-indigo-400/20 text-indigo-200 border-indigo-500/30',
    '8': 'bg-slate-400/20 text-slate-200 border-slate-500/30',
    '9': 'bg-orange-400/20 text-orange-200 border-orange-500/30',
    '10': 'bg-teal-400/20 text-teal-200 border-teal-500/30',
  };
  
  return colors[colorId || '1'] || 'bg-blue-400/20 text-blue-200 border-blue-500/30';
};
