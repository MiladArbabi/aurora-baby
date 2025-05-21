// src/data/prebuiltStoryPages.ts

export interface StoryPage {
    text: string;
    // either a local require or a remote URL
    image?: string;          
    // or a Lottie JSON import
    animation?: any;         
  }

export const prebuiltStoryPages: Record<string, StoryPage[]> = {
    'birk-forest-journey': [
        {
          text: "Once upon a time, in a whispering forest filled with ancient pines…",
          image: require('../assets/storyImages/Birk - Xesus Version - with tree.png'),
        },
        {
          text: "All the woodland creatures stirred beneath the emerald canopy…",
          image: require('../assets/storyImages/Birk - Xesus Version - with tree.png'),
        },
        {
          text: "And that is how Birk began his grand adventure.",
          image: require('../assets/storyImages/Birk - Xesus Version - with tree.png'),
        },
      ],
    'freya-sings': [
    {
      text: "High above the silver trees, Freya lifted her voice to the stars…",
      image: require('../assets/storyImages/Birk - Xesus Version - with tree.png'),
    },
    {
      text: "Each note drifted like a feather across the moonlit sky…",
      image: require('../assets/storyImages/Birk - Xesus Version - with tree.png'),
    },
    {
      text: "And the night itself held its breath…",
      image: require('../assets/storyImages/Birk - Xesus Version - with tree.png'),
    },
  ],
    // …etc for each prebuilt ID
  }
  