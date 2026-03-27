import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EvidenceBadge } from '@/components/EvidenceBadge';
import { 
  getReferencesByIds, 
  sortReferencesByEvidence,
  LiteratureReference 
} from '@/lib/references/literatureDatabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferencesCitationProps {
  referenceIds: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxInitialDisplay?: number;
  className?: string;
  title?: string;
}

export function ReferencesCitation({
  referenceIds,
  collapsible = true,
  defaultExpanded = false,
  maxInitialDisplay = 3,
  className,
  title
}: ReferencesCitationProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  
  const isTraditionalChinese = language === 'zh-TW';
  
  const references = sortReferencesByEvidence(getReferencesByIds(referenceIds));
  
  if (references.length === 0) {
    return null;
  }
  
  const displayedRefs = isExpanded || !collapsible 
    ? references 
    : references.slice(0, maxInitialDisplay);
  
  const remainingCount = references.length - maxInitialDisplay;
  
  const toggleFindings = (id: string) => {
    const newSet = new Set(expandedFindings);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedFindings(newSet);
  };
  
  const formatAuthors = (authors: string[], maxDisplay = 3): { display: string; full: string } => {
    const full = authors.join(', ');
    if (authors.length <= maxDisplay) {
      return { display: full, full };
    }
    const display = `${authors.slice(0, maxDisplay).join(', ')} et al.`;
    return { display, full };
  };
  
  const truncateText = (text: string, maxLength: number): { truncated: string; isTruncated: boolean } => {
    if (text.length <= maxLength) {
      return { truncated: text, isTruncated: false };
    }
    return { 
      truncated: text.substring(0, maxLength) + '...', 
      isTruncated: true 
    };
  };
  
  const renderReference = (ref: LiteratureReference, index: number) => {
    const authors = formatAuthors(ref.authors);
    const displayTitle = isTraditionalChinese && ref.titleCN ? ref.titleCN : ref.title;
    const secondaryTitle = isTraditionalChinese && ref.titleCN ? ref.title : ref.titleCN;
    const keyFindings = isTraditionalChinese && ref.keyFindingsCN ? ref.keyFindingsCN : ref.keyFindings;
    const { truncated: truncatedFindings, isTruncated } = truncateText(keyFindings, 100);
    const showFullFindings = expandedFindings.has(ref.id);
    
    return (
      <li key={ref.id} className="pb-4 last:pb-0">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
            {index + 1}
          </span>
          
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Title and Evidence Badge */}
            <div className="flex items-start gap-2 flex-wrap">
              <h4 className="font-medium text-sm leading-tight flex-1">
                {displayTitle}
              </h4>
              <EvidenceBadge level={ref.evidenceLevel} size="sm" />
            </div>
            
            {/* Secondary Title (if bilingual) */}
            {secondaryTitle && (
              <p className="text-xs text-muted-foreground italic">
                {secondaryTitle}
              </p>
            )}
            
            {/* Authors */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground cursor-help">
                    {authors.display}
                  </p>
                </TooltipTrigger>
                {authors.display !== authors.full && (
                  <TooltipContent className="max-w-md">
                    <p className="text-xs">{authors.full}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            
            {/* Journal, Year, Volume */}
            <p className="text-xs text-muted-foreground">
              <span className="italic">{ref.journal}</span>
              {ref.year && ` (${ref.year})`}
              {ref.volume && `, ${ref.volume}`}
              {ref.pages && `: ${ref.pages}`}
              {ref.sampleSize && (
                <span className="ml-2 text-primary">
                  n={ref.sampleSize}
                </span>
              )}
            </p>
            
            {/* DOI/PMID Links */}
            <div className="flex items-center gap-2 text-xs">
              {ref.doi && (
                <a
                  href={`https://doi.org/${ref.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  DOI
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {ref.pmid && (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  PubMed
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            
            {/* Key Findings */}
            <div className="mt-2 p-2 bg-muted/50 rounded-md">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {isTraditionalChinese ? '關鍵發現' : 'Key Findings'}:
              </p>
              <p className="text-xs leading-relaxed">
                {showFullFindings ? keyFindings : truncatedFindings}
              </p>
              {isTruncated && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs mt-1"
                  onClick={() => toggleFindings(ref.id)}
                >
                  {showFullFindings 
                    ? (isTraditionalChinese ? '收起' : 'Show less')
                    : (isTraditionalChinese ? '顯示更多' : 'Show more')
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      </li>
    );
  };
  
  return (
    <Card className={cn('border-l-4 border-l-primary/30', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4" />
          {title || (isTraditionalChinese ? '參考文獻' : 'References')}
          <span className="text-sm font-normal text-muted-foreground">
            ({references.length} {isTraditionalChinese ? '篇' : 'studies'})
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {isTraditionalChinese 
            ? '依證據等級排序：IA/IB（RCT）> IIA/IIB（世代研究）> III-V（觀察性研究/專家意見）'
            : 'Sorted by evidence level: IA/IB (RCT) > IIA/IIB (Cohort) > III-V (Observational/Expert opinion)'
          }
        </p>
      </CardHeader>
      
      <CardContent>
        <ol className="list-none space-y-4">
          {displayedRefs.map((ref, index) => renderReference(ref, index))}
        </ol>
        
        {collapsible && remainingCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-4"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {isTraditionalChinese ? '收起' : 'Show less'}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {isTraditionalChinese 
                  ? `顯示全部 ${references.length} 篇文獻`
                  : `Show all ${references.length} references`
                }
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Compact inline citation component
export function InlineCitation({ 
  referenceIds,
  className 
}: { 
  referenceIds: string[];
  className?: string;
}) {
  const references = getReferencesByIds(referenceIds);
  
  if (references.length === 0) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            'inline-flex items-center text-xs text-primary cursor-help',
            className
          )}>
            [{references.map((r, i) => (
              <span key={r.id}>
                {i > 0 && ', '}
                {r.authors[0]?.split(' ').pop() || 'Unknown'} {r.year}
              </span>
            ))}]
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            {references.map(ref => (
              <div key={ref.id} className="text-xs">
                <p className="font-medium">{ref.title}</p>
                <p className="text-muted-foreground">
                  {ref.authors.slice(0, 3).join(', ')}{ref.authors.length > 3 ? ' et al.' : ''} ({ref.year})
                </p>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
