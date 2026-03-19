// Request parameters for the notes generation endpoint
export interface NotesRequest {
  url: string; // URL of the document to build notes for
  email: string; // Valid 'official' email
  type: "user" | "business" | "academic" | "developer"; // User type
  ts: number; // Timestamp
  key: number; // Key value
}

// Token position information
export interface TokenPosition {
  startingSequenceNumber: number;
  startingWordNumber: number;
  endingSequenceNumber: number;
  endingWordNumber: number;
  originalStartingSequenceNumber: number;
  originalStartingWordNumber: number;
  originalEndingSequenceNumber: number;
  originalEndingWordNumber: number;
}

// Token information
export interface Token {
  key: number;
  _id: string;
  nameType: string;
  usage: string;
  possessive: boolean;
  lemma: string;
  plurality: string;
  category: string;
  spelling: string;
  genderType: string;
  tokenPosition: TokenPosition;
}

// Note object
export interface Note {
  tokens: Token[];
  suppress: boolean;
  text: string;
  startingSentenceNumber: number;
  endingSentenceNumber: number;
  startingWordNumber: number;
  endingWordNumber: number;
  nIn: string;
  nOut: string;
}

// Document content
export interface CompleteDocument {
  sentences: string[];
  notes: Note[];
  errata: string[];
  reference?: string;
  sentenceCount?: number;
  noteCount?: number;
  errataCount?: number;
}

// Response from the notes generation endpoint
export interface NotesResponse {
  complete_document: CompleteDocument;
  Copyright?: string;
  Credit?: string;
  Prohibited?: string;
  Contact?: string;
}

// Authentication response
export interface AuthResponse {
  access_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

// Add these new interfaces to bhb.ts
export interface EntityData {
  nodes: {
    id: string;
    type: string; // Based on nameType from Token
    name: string; // Based on spelling from Token
  }[];
  links: {
    source: string;
    target: string;
    type: string;
  }[];
}

export interface SentimentData {
  timestamp: string;
  sentiment: number;
  noteId: string;
}

export interface TopicData {
  name: string;
  children: {
    name: string;
    value: number;
    children?: { name: string; value: number; }[];
  }[];
}

export interface InsightData {
  type: string;
  content: string;
  noteId: string;
}
