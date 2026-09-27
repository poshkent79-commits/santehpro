import React from 'react';
import { DiagnosticWizard } from './DiagnosticWizard';
import { Article } from '../types';

interface BreakdownsViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenSpecialists?: () => void;
  initialSubTab?: 'chat' | 'diagnostic';
  initialPrompt?: string;
  onNavigateToCabinet?: (tab?: string) => void;
}

export const BreakdownsView: React.FC<BreakdownsViewProps> = ({
  articles,
  onSelectArticle,
  onOpenSpecialists,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Quick Plumbing Breakdown Diagnostics */}
      <DiagnosticWizard
        articles={articles}
        onSelectArticle={onSelectArticle}
        onOpenSpecialists={onOpenSpecialists}
      />
    </div>
  );
};
