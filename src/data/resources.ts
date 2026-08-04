import type { ResourceCategory } from "@/lib/taxonomy";

export interface Resource {
  id: string;
  slug: string;
  category: ResourceCategory;
  title: string;
  description: string;
  content: string;
  author: string;
  emoji: string;
  tags: string[];
  readTime: string;
}

export const RESOURCES: Resource[] = [
  {
    id: "1",
    slug: "texture-consistent-snacks-arfid",
    category: "food",
    title: "Texture-consistent snacks for ARFID",
    description: "A list of safe, predictable snacks that never change texture from batch to batch.",
    content: "When dealing with ARFID or extreme picky eating, consistency is everything. A single burnt edge or weird lump can ruin a safe food for months. Here are our go-to brands that are mechanically processed to be exactly the same every single time: \n\n1. Ritz Crackers (Original)\n2. Veggie Straws (Sea Salt)\n3. McDonald's French Fries (specifically because of their strict cooking timers)\n4. Cheerios\n5. Specific brands of puréed pouches.",
    author: "Elena R.",
    emoji: "/emojis/pot-of-food.webp",
    tags: ["ARFID", "Snacks", "Safe Foods"],
    readTime: "3 min"
  },
  {
    id: "2",
    slug: "morning-visual-schedule",
    category: "routines",
    title: "Visual schedule for morning transitions",
    description: "How to reduce morning meltdowns using a low-demand visual checklist.",
    content: "Mornings are hard. We switched from verbal commands ('put your shoes on', 'brush your teeth') to a completely silent visual board. I point to the board, he moves the velcro tab when it's done. It removes the 'nagging' tone from my voice and lowers the PDA (Pathological Demand Avoidance) trigger. I used a simple laminator and printed icons.",
    author: "Sarah M.",
    emoji: "/emojis/sun-behind-cloud.webp",
    tags: ["Mornings", "PDA", "Visuals"],
    readTime: "4 min"
  },
  {
    id: "3",
    slug: "proprioceptive-heavy-work",
    category: "sensory",
    title: "Heavy work activities for regulation",
    description: "Quick physical activities to help ground a dysregulated nervous system.",
    content: "When my sensory seeker is bouncing off the walls, we do 'heavy work'. This provides proprioceptive input to the joints and muscles, which is incredibly calming. Favorites include: pushing a laundry basket full of books across the carpet, 'wall push-ups', bear hugs, and wearing a weighted vest for 15 minutes. It's like a reset button for the brain.",
    author: "Coach J",
    emoji: "/emojis/musical-notes.webp",
    tags: ["Sensory Seeker", "Proprioceptive", "Heavy Work"],
    readTime: "5 min"
  },
  {
    id: "4",
    slug: "low-demand-communication-cards",
    category: "communication",
    title: "Color-coded cards for shutdown days",
    description: "A system for when speaking is just too hard.",
    content: "During sensory overloads or autistic shutdowns, speech can be lost temporarily. We use a keychain of three cards: Green (I'm okay, just resting), Yellow (I need quiet, please don't ask me questions), and Red (I am overwhelmed, I need my safe space now). They can just hand me the card without forcing words out.",
    author: "TiredMom99",
    emoji: "/emojis/studio-microphone.webp",
    tags: ["Shutdowns", "AAC", "Non-speaking"],
    readTime: "2 min"
  },
  {
    id: "5",
    slug: "loop-earplugs-honest-review",
    category: "reviews",
    title: "Loop Earplugs: Do they actually work?",
    description: "An honest review of Loop Engage vs Experience for auditory sensitivity.",
    content: "We tried both. The 'Engage' loops are fantastic for the classroom because the teacher's voice still comes through, but the background hum of the AC and fluorescent lights is cut out. The 'Experience' ones are better for grocery stores. They do amplify your own internal voice/breathing though, which took my kid a week to get used to.",
    author: "AutismMom_Jen",
    emoji: "/emojis/star.webp",
    tags: ["Auditory", "Gear", "School"],
    readTime: "4 min"
  },
  {
    id: "6",
    slug: "iep-binder-organization",
    category: "school",
    title: "The Ultimate IEP Binder System",
    description: "How to organize your child's medical and school records for IEP meetings.",
    content: "Never walk into an IEP meeting without your binder. I organize mine into tabs: 1. Current IEP. 2. Last year's IEP. 3. Outside Evaluations (OT, PT, Speech). 4. Communication Log (emails printed out). 5. Work samples (proof of current level). Use a 3-inch D-ring binder. When they say 'we don't see that behavior here', you flip to tab 4.",
    author: "AdvocateMama",
    emoji: "/emojis/backpack.webp",
    tags: ["IEP", "Advocacy", "Organization"],
    readTime: "6 min"
  }
];
