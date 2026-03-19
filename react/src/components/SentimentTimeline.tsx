'use client';

import { useState, useEffect } from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Brush, Area, ComposedChart
} from 'recharts';
import { CompleteDocument } from '@/types/bhb';

interface Props {
  data: CompleteDocument;
}

interface SentimentDataPoint {
  timestamp: string;
  sentiment: number;
  noteId: string;
  text: string;
  positiveWords: string[];
  negativeWords: string[];
  neutralCount: number;
}

// Positive and negative sentiment word lists (simplified example)
const positiveWords = ['good', 'great', 'excellent', 'happy', 'positive', 'success', 'win', 'best', 'better', 'improve'];
const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'negative', 'fail', 'worst', 'worse', 'problem', 'difficult'];

function processSentimentData(data: CompleteDocument): SentimentDataPoint[] {
  // Process each note to extract sentiment data
  const sentimentData = data.notes.map((note, index) => {
    const { sentiment, positiveWords: posWords, negativeWords: negWords, neutralCount } = calculateNoteSentiment(note.text);
    
    return {
      timestamp: `Note ${index + 1}`,
      index: index,
      sentiment: sentiment,
      noteId: note.nIn,
      text: note.text.length > 100 ? note.text.substring(0, 100) + '...' : note.text,
      positiveWords: posWords,
      negativeWords: negWords,
      neutralCount: neutralCount
    };
  });

  // Sort by sentiment value (optional - can be toggled by user)
  return sentimentData;
}

function calculateNoteSentiment(text: string): { 
  sentiment: number; 
  positiveWords: string[]; 
  negativeWords: string[]; 
  neutralCount: number 
} {
  const words = text.toLowerCase().split(/\s+/);
  const foundPositive: string[] = [];
  const foundNegative: string[] = [];
  
  // Count positive and negative words
  words.forEach(word => {
    // Clean the word of punctuation
    const cleanWord = word.replace(/[^\w\s]/gi, '');
    if (positiveWords.includes(cleanWord)) {
      foundPositive.push(cleanWord);
    } else if (negativeWords.includes(cleanWord)) {
      foundNegative.push(cleanWord);
    }
  });
  
  // Calculate sentiment score between 0 and 1
  const totalSentimentWords = foundPositive.length + foundNegative.length;
  let sentiment = 0.5; // Neutral default
  
  if (totalSentimentWords > 0) {
    sentiment = 0.5 + (foundPositive.length - foundNegative.length) / (2 * totalSentimentWords);
  }
  
  // Ensure sentiment is between 0 and 1
  sentiment = Math.max(0, Math.min(1, sentiment));
  
  return {
    sentiment,
    positiveWords: foundPositive,
    negativeWords: foundNegative,
    neutralCount: words.length - totalSentimentWords
  };
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 p-3 rounded border border-gray-700 shadow-lg text-sm">
        <p className="font-semibold text-blue-300">{label}</p>
        <p className="text-gray-300">
          Sentiment: <span className={
            data.sentiment > 0.6 ? "text-green-400" : 
            data.sentiment < 0.4 ? "text-red-400" : "text-yellow-400"
          }>
            {(data.sentiment * 100).toFixed(1)}%
          </span>
        </p>
        <div className="mt-2 border-t border-gray-700 pt-2">
          <p className="text-gray-400 text-xs">{data.text}</p>
        </div>
        {data.positiveWords.length > 0 && (
          <div className="mt-1">
            <p className="text-green-400 text-xs">
              Positive: {data.positiveWords.slice(0, 3).join(', ')}
              {data.positiveWords.length > 3 ? ` +${data.positiveWords.length - 3} more` : ''}
            </p>
          </div>
        )}
        {data.negativeWords.length > 0 && (
          <div className="mt-1">
            <p className="text-red-400 text-xs">
              Negative: {data.negativeWords.slice(0, 3).join(', ')}
              {data.negativeWords.length > 3 ? ` +${data.negativeWords.length - 3} more` : ''}
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function SentimentTimeline({ data }: Props) {
  const [processedData, setProcessedData] = useState<SentimentDataPoint[]>([]);
  const [sortByTimestamp, setSortByTimestamp] = useState(true);
  const [, setSelectedRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    const sentimentData = processSentimentData(data);
    setProcessedData(sentimentData);
  }, [data]);

  const sortedData = [...processedData].sort((a, b) => {
    if (sortByTimestamp) {
      return (a as any).index - (b as any).index;
    } else {
      return a.sentiment - b.sentiment;
    }
  });

  // Calculate average sentiment
  const avgSentiment = processedData.length > 0 
    ? processedData.reduce((sum, item) => sum + item.sentiment, 0) / processedData.length
    : 0.5;

  const handleBrushChange = (brushData: any) => {
    if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
      setSelectedRange([brushData.startIndex, brushData.endIndex]);
    } else {
      setSelectedRange(null);
    }
  };

  // Get sentiment distribution
  const sentimentCounts = {
    positive: processedData.filter(d => d.sentiment > 0.6).length,
    neutral: processedData.filter(d => d.sentiment >= 0.4 && d.sentiment <= 0.6).length,
    negative: processedData.filter(d => d.sentiment < 0.4).length
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-800 rounded-lg p-4 text-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-blue-300">Sentiment Analysis</h3>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSortByTimestamp(!sortByTimestamp)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            Sort by: {sortByTimestamp ? 'Timestamp' : 'Sentiment'}
          </button>
        </div>
      </div>

      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={sortedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#a0aec0"
              tick={{ fill: '#a0aec0' }}
            />
            <YAxis 
              domain={[0, 1]} 
              stroke="#a0aec0"
              tick={{ fill: '#a0aec0' }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              label={{ 
                value: 'Sentiment', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#a0aec0'
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '10px',
                color: '#a0aec0'
              }}
            />
            <ReferenceLine 
              y={avgSentiment} 
              stroke="#f6e05e" 
              strokeDasharray="3 3"
              label={{ 
                value: 'Average', 
                position: 'right', 
                fill: '#f6e05e'
              }}
            />
            <ReferenceLine 
              y={0.5} 
              stroke="#a0aec0" 
              strokeDasharray="3 3"
              label={{ 
                value: 'Neutral', 
                position: 'left', 
                fill: '#a0aec0'
              }}
            />
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#68d391" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#f6e05e" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#fc8181" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="sentiment" 
              fill="url(#sentimentGradient)" 
              stroke="#4299e1"
              fillOpacity={0.3}
            />
            <Line 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#4299e1" 
              strokeWidth={2}
              dot={{ 
                stroke: '#4299e1', 
                strokeWidth: 2, 
                r: 4,
                fill: '#2d3748'
              }}
              activeDot={{ 
                stroke: '#4299e1', 
                strokeWidth: 2, 
                r: 6,
                fill: '#2d3748'
              }}
            />
            <Brush 
              dataKey="timestamp" 
              height={30} 
              stroke="#4a5568"
              fill="#2d3748"
              onChange={handleBrushChange}
              tickFormatter={() => ''}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-700 p-2 rounded">
          <div className="text-red-400 text-lg font-semibold">
            {sentimentCounts.negative}
          </div>
          <div className="text-xs text-gray-400">Negative</div>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <div className="text-yellow-400 text-lg font-semibold">
            {sentimentCounts.neutral}
          </div>
          <div className="text-xs text-gray-400">Neutral</div>
        </div>
        <div className="bg-gray-700 p-2 rounded">
          <div className="text-green-400 text-lg font-semibold">
            {sentimentCounts.positive}
          </div>
          <div className="text-xs text-gray-400">Positive</div>
        </div>
      </div>
    </div>
  );
} 