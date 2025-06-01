// src/models/event.ts
export type InteractionEventType = 'voiceCommand' | 'regionTapped' | 'aiSuggestionClicked';

export interface InteractionEvent {
  event: InteractionEventType;
  payload: Record<string, any>;
  timestamp: string; // ISO date
  confidence?: number; // for voiceCommand
}
