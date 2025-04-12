export interface Story {
  id: string;
  title: string;
  layer: 'Surface' | 'Underwater' | 'Sky' | 'Undersurface';
  stemFocus: 'Science' | 'Technology' | 'Engineering' | 'Math';
  traitFocus: string;
  language: string;
  characters: string[];
}

export const prebuiltStories: Story[] = [
  {
    id: 'birk-freya-vanished-star',
    title: 'Birk and Freya: The Vanished Star',
    layer: 'Surface',
    stemFocus: 'Science', // Observing stars, following clues
    traitFocus: 'Teamwork', // Birk, Freya, and friends collaborate
    language: 'English',
    characters: ['Birk', 'Freya', 'Nordra', 'AXO', 'Moss Moles', 'Arvid', 'Whooper Swans', 'Atlantic Salmons', 'Muruk'],
  },
];