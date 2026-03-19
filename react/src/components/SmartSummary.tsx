'use client';

import { CompleteDocument } from '@/types/bhb';

interface Props {
  data: CompleteDocument;
}

function processInsights(data: CompleteDocument) {
  return data.notes
    .filter(note => !note.suppress)
    .map(note => ({
      type: determineInsightType(note), // You'll need to implement this
      content: note.text,
      noteId: note.nIn
    }));
}

function determineInsightType(_note: any) {
  // Implement logic to determine the type of insight
  // Could be based on tokens, categories, or other patterns
  return "Key Point"; // Default type
}

export default function SmartSummary({ data }: Props) {
  const insights = processInsights(data);

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div key={index} className="border-l-4 border-blue-500 pl-4">
          <span className="text-sm font-semibold text-blue-600">{insight.type}</span>
          <p className="text-gray-700">{insight.content}</p>
        </div>
      ))}
    </div>
  );
} 