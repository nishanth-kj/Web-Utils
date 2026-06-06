import { ALL_FORMATS } from '@/lib/formats';
import Link from 'next/link';
import { FileCode, ChevronRight } from 'lucide-react';

export default function ViewPage() {
  return (
    <div className="min-h-full bg-zinc-50/50 dark:bg-zinc-950/50 p-8 flex flex-col items-center overflow-auto">
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Select a Format
          </h1>
          <p className="text-zinc-500 mt-2">
            Choose a file format to open the Live Previewer. You can always change the format later from the viewer dropdown.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ALL_FORMATS.slice(0, 10).map((fmt) => (
            <Link 
              key={fmt} 
              href={`/view/${fmt}`}
              className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <FileCode className="size-5" />
                </div>
                <span className="font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider text-sm">{fmt}</span>
              </div>
              <ChevronRight className="size-4 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
