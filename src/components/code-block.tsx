"use client";

import { useState, type FC } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CodeBlockProps {
  code: string;
  lang?: string;
  className?: string;
}

export const CodeBlock: FC<CodeBlockProps> = ({ code, lang, className }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code.trim()).then(() => {
      setHasCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The code has been copied successfully.",
      })
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  return (
    <div className={cn("relative group my-4", className)}>
      <pre className="text-sm bg-muted/50 dark:bg-muted/20 text-foreground rounded-md p-4 overflow-x-auto border">
        <code className={`language-${lang}`}>{code.trim()}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
        aria-label="Copy code"
      >
        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};
