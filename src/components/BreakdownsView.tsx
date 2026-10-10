import React from 'react';
import { DiagnosticWizard } from './DiagnosticWizard';
import { Article } from '../types';

interface BreakdownsViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenSpecialists?: () => void;
  selectedCity?: string;
  initialSubTab?: string;
  initialPrompt?: string;
  onNavigateToCabinet?: (tab?: string) => void;
}

export const BreakdownsView: React.FC<BreakdownsViewProps> = ({
  articles,
  onSelectArticle,
  onOpenSpecialists,
  selectedCity,
}) => {
  return (
    <div className="w-full">
      {/* Основной интерактивный модуль диагностики */}
      <DiagnosticWizard
        articles={articles}
        onSelectArticle={onSelectArticle}
        onOpenSpecialists={onOpenSpecialists}
        selectedCity={selectedCity}
      />
    </div>
  );
};
