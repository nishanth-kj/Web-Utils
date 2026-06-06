import { ALL_FORMATS } from '@/lib/formats';
import Link from 'next/link';
import { 
  FileCode, 
  ChevronRight, 
  Globe, 
  Braces, 
  Table, 
  Image as ImageIcon, 
  FileJson,
  Sparkles
} from 'lucide-react';

const FORMAT_ICONS: Record<string, any> = {
  html: Globe,
  json: Braces,
  markdown: FileCode,
  csv: Table,
  svg: ImageIcon,
  yaml: FileJson,
  react: FileCode,
  xml: FileCode
};

export default function ViewPage() {
  return (
    <div className="min-h-full bg-background p-8 flex flex-col items-center overflow-auto custom-scrollbar">
      <div className="max-w-5xl w-full mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Live Previewer
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Select a file format below to launch the interactive live previewer. Experience real-time rendering, syntax highlighting, and advanced formatting tools.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_FORMATS.slice(0, 8).map((fmt) => {
            const Icon = FORMAT_ICONS[fmt] || FileCode;
            
            return (
              <Link 
                key={fmt} 
                href={`/view/${fmt}`}
                className="group flex flex-col p-5 bg-card border border-border rounded-xl transition-all hover:border-foreground/20 hover:shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="size-4" />
                    </div>
                    <h3 className="font-semibold text-foreground tracking-tight uppercase">{fmt}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">Interactive {fmt.toUpperCase()} Viewer</p>
                <div className="mt-auto flex items-center justify-end">
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
