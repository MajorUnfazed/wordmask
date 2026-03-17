import { ANIMALS_PACK } from './packs/animals'
import { CAMPUS_LIFE_PACK } from './packs/campusLife'
import { EVERYDAY_PACK } from './packs/everyday'
import { F1_PACK } from './packs/f1'
import { FASHION_PACK } from './packs/fashion'
import { FOOD_PACK } from './packs/food'
import { GAMING_PACK } from './packs/gaming'
import { GEOGRAPHY_PACK } from './packs/geography'
import { INTERNET_CULTURE_PACK } from './packs/internetCulture'
import { MOVIES_PACK } from './packs/movies'
import { MUSIC_PACK } from './packs/music'
import { PARTY_MODE_PACK } from './packs/partyMode'
import { PROFESSIONS_PACK } from './packs/professions'
import { RANDOM_OBJECTS_PACK } from './packs/randomObjects'
import { SCIENCE_PACK } from './packs/science'
import { SPORTS_PACK } from './packs/sports'
import { TECHNOLOGY_PACK } from './packs/technology'

export const ALL_WORDS = [
  ...ANIMALS_PACK,
  ...CAMPUS_LIFE_PACK,
  ...EVERYDAY_PACK,
  ...F1_PACK,
  ...FASHION_PACK,
  ...FOOD_PACK,
  ...GAMING_PACK,
  ...GEOGRAPHY_PACK,
  ...INTERNET_CULTURE_PACK,
  ...MOVIES_PACK,
  ...MUSIC_PACK,
  ...PARTY_MODE_PACK,
  ...PROFESSIONS_PACK,
  ...RANDOM_OBJECTS_PACK,
  ...SCIENCE_PACK,
  ...SPORTS_PACK,
  ...TECHNOLOGY_PACK,
] as const

export const CATEGORIES = [
  "Animals",
  "Campus Life",
  "Everyday",
  "Formula 1",
  "Fashion",
  "Food",
  "Gaming",
  "Geography",
  "Internet Culture",
  "Movies",
  "Music",
  "Party Mode",
  "Professions",
  "Random Objects",
  "Science",
  "Sports",
  "Technology"
] as const
