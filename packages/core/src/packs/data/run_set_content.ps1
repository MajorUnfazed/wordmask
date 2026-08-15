$ErrorActionPreference = 'Stop'

$tsContent = @'
import type { WordEntry } from '../../../types/packs'

export const GAMING_PACK: WordEntry[] = [
  { "id": "gaming_1", "word": "Super Mario", "category": "Gaming", "hints": ["Plumber", "Mushroom", "Nintendo"] },
  { "id": "gaming_2", "word": "Minecraft", "category": "Gaming", "hints": ["Blocks", "Creepers", "Crafting"] },
  { "id": "gaming_3", "word": "Zelda", "category": "Gaming", "hints": ["Link", "Triforce", "Hyrule"] },
  { "id": "gaming_4", "word": "Tetris", "category": "Gaming", "hints": ["Blocks", "Puzzle", "Lines"] },
  { "id": "gaming_5", "word": "Pac-Man", "category": "Gaming", "hints": ["Ghosts", "Pellets", "Maze"] },
  { "id": "gaming_6", "word": "Pokemon", "category": "Gaming", "hints": ["Pikachu", "Catch", "Monsters"] },
  { "id": "gaming_7", "word": "Halo", "category": "Gaming", "hints": ["Master", "Chief", "Cortana"] },
  { "id": "gaming_8", "word": "Fortnite", "category": "Gaming", "hints": ["Battle", "Royale", "Building"] },
  { "id": "gaming_9", "word": "Overwatch", "category": "Gaming", "hints": ["Hero", "Shooter", "Blizzard"] },
  { "id": "gaming_10", "word": "Skyrim", "category": "Gaming", "hints": ["Dragons", "Elder", "Scrolls"] },
  { "id": "gaming_11", "word": "Doom", "category": "Gaming", "hints": ["Demons", "Mars", "Shotgun"] },
  { "id": "gaming_12", "word": "Sonic", "category": "Gaming", "hints": ["Hedgehog", "Rings", "Fast"] },
  { "id": "gaming_13", "word": "Portal", "category": "Gaming", "hints": ["Cake", "Aperture", "Physics"] },
  { "id": "gaming_14", "word": "Half-Life", "category": "Gaming", "hints": ["Gordon", "Freeman", "Crowbar"] },
  { "id": "gaming_15", "word": "Roblox", "category": "Gaming", "hints": ["User", "Created", "Avatars"] },
  { "id": "gaming_16", "word": "Terraria", "category": "Gaming", "hints": ["2D", "Mining", "Bosses"] },
  { "id": "gaming_17", "word": "Among Us", "category": "Gaming", "hints": ["Impostor", "Tasks", "Sus"] },
  { "id": "gaming_18", "word": "Street Fighter", "category": "Gaming", "hints": ["Ryu", "Hadouken", "Capcom"] },
  { "id": "gaming_19", "word": "Mortal Kombat", "category": "Gaming", "hints": ["Fatality", "Scorpion", "Sub-Zero"] },
  { "id": "gaming_20", "word": "Smash Bros", "category": "Gaming", "hints": ["Nintendo", "Fighting", "Crossover"] },
  { "id": "gaming_21", "word": "Animal Crossing", "category": "Gaming", "hints": ["Tom", "Nook", "Islands"] },
  { "id": "gaming_22", "word": "Stardew Valley", "category": "Gaming", "hints": ["Farming", "Simulation", "Pelican"] },
  { "id": "gaming_23", "word": "The Witcher", "category": "Gaming", "hints": ["Geralt", "Monster", "Hunter"] },
  { "id": "gaming_24", "word": "Cyberpunk", "category": "Gaming", "hints": ["Night", "City", "Keanu"] },
  { "id": "gaming_25", "word": "Fallout", "category": "Gaming", "hints": ["Vault", "Wasteland", "Pip-Boy"] },
  { "id": "gaming_26", "word": "Dark Souls", "category": "Gaming", "hints": ["Hard", "Bonfire", "Bosses"] },
  { "id": "gaming_27", "word": "Elden Ring", "category": "Gaming", "hints": ["Tarnished", "Maiden", "Tree"] },
  { "id": "gaming_28", "word": "Bloodborne", "category": "Gaming", "hints": ["Yharnam", "Hunters", "Beasts"] },
  { "id": "gaming_29", "word": "Sekiro", "category": "Gaming", "hints": ["Wolf", "Parry", "Shinobi"] },
  { "id": "gaming_30", "word": "Persona", "category": "Gaming", "hints": ["High", "School", "Shadows"] },
  { "id": "gaming_31", "word": "Final Fantasy", "category": "Gaming", "hints": ["Chocobo", "Moogle", "Crystal"] },
  { "id": "gaming_32", "word": "Kingdom Hearts", "category": "Gaming", "hints": ["Disney", "Keyblade", "Sora"] },
  { "id": "gaming_33", "word": "Metal Gear", "category": "Gaming", "hints": ["Snake", "Stealth", "Box"] },
  { "id": "gaming_34", "word": "Resident Evil", "category": "Gaming", "hints": ["Zombies", "Umbrella", "Mansion"] },
  { "id": "gaming_35", "word": "Silent Hill", "category": "Gaming", "hints": ["Fog", "Pyramid", "Radio"] },
  { "id": "gaming_36", "word": "Castlevania", "category": "Gaming", "hints": ["Dracula", "Vampire", "Whip"] },
  { "id": "gaming_37", "word": "Metroid", "category": "Gaming", "hints": ["Samus", "Bounty", "Hunter"] },
  { "id": "gaming_38", "word": "Donkey Kong", "category": "Gaming", "hints": ["Ape", "Barrels", "Bananas"] },
  { "id": "gaming_39", "word": "Kirby", "category": "Gaming", "hints": ["Pink", "Puffball", "Inhale"] },
  { "id": "gaming_40", "word": "Star Fox", "category": "Gaming", "hints": ["Arwing", "Barrel", "Roll"] },
  { "id": "gaming_41", "word": "F-Zero", "category": "Gaming", "hints": ["Captain", "Falcon", "Racing"] },
  { "id": "gaming_42", "word": "Mario Kart", "category": "Gaming", "hints": ["Blue", "Shell", "Racing"] },
  { "id": "gaming_43", "word": "Mario Party", "category": "Gaming", "hints": ["Board", "Game", "Minigames"] },
  { "id": "gaming_44", "word": "Splatoon", "category": "Gaming", "hints": ["Squid", "Ink", "Paint"] },
  { "id": "gaming_45", "word": "Pikmin", "category": "Gaming", "hints": ["Plant", "Creatures", "Olimar"] },
  { "id": "gaming_46", "word": "Fire Emblem", "category": "Gaming", "hints": ["Tactics", "Grid", "Permadeath"] },
  { "id": "gaming_47", "word": "Xenoblade", "category": "Gaming", "hints": ["Monado", "Shulk", "Titan"] },
  { "id": "gaming_48", "word": "EarthBound", "category": "Gaming", "hints": ["Ness", "PSI", "Mother"] },
  { "id": "gaming_49", "word": "Chrono Trigger", "category": "Gaming", "hints": ["Time", "Travel", "Lavos"] },
  { "id": "gaming_50", "word": "Secret of Mana", "category": "Gaming", "hints": ["Tree", "Action", "RPG"] },
  { "id": "gaming_51", "word": "Dragon Quest", "category": "Gaming", "hints": ["Slime", "Hero", "Turn-Based"] },
  { "id": "gaming_52", "word": "Monster Hunter", "category": "Gaming", "hints": ["Rathalos", "Wyvern", "Weapons"] },
  { "id": "gaming_53", "word": "Genshin Impact", "category": "Gaming", "hints": ["Gacha", "Anime", "Traveler"] },
  { "id": "gaming_54", "word": "League of Legends", "category": "Gaming", "hints": ["MOBA", "Riot", "Champions"] },
  { "id": "gaming_55", "word": "Dota 2", "category": "Gaming", "hints": ["Valve", "Defense", "Ancients"] },
  { "id": "gaming_56", "word": "World of Warcraft", "category": "Gaming", "hints": ["Alliance", "Horde", "MMO"] },
  { "id": "gaming_57", "word": "Runescape", "category": "Gaming", "hints": ["Grinding", "Gielinor", "Woodcutting"] },
  { "id": "gaming_58", "word": "Guild Wars", "category": "Gaming", "hints": ["Tyria", "Events", "MMORPG"] },
  { "id": "gaming_59", "word": "Destiny", "category": "Gaming", "hints": ["Guardians", "Ghost", "Traveler"] },
  { "id": "gaming_60", "word": "Warframe", "category": "Gaming", "hints": ["Tenno", "Ninjas", "Space"] },
  { "id": "gaming_61", "word": "Apex Legends", "category": "Gaming", "hints": ["Hero", "Battle", "Royale"] },
  { "id": "gaming_62", "word": "PUBG", "category": "Gaming", "hints": ["Chicken", "Dinner", "Pan"] },
  { "id": "gaming_63", "word": "Valorant", "category": "Gaming", "hints": ["Agents", "Spike", "Tactical"] },
  { "id": "gaming_64", "word": "CSGO", "category": "Gaming", "hints": ["Terrorist", "Counter", "Bomb"] },
  { "id": "gaming_65", "word": "Rainbow Six", "category": "Gaming", "hints": ["Siege", "Operators", "Destruction"] },
  { "id": "gaming_66", "word": "Call of Duty", "category": "Gaming", "hints": ["Warzone", "Zombies", "Shooter"] },
  { "id": "gaming_67", "word": "Battlefield", "category": "Gaming", "hints": ["Levolution", "Vehicles", "Conquest"] },
  { "id": "gaming_68", "word": "Gears of War", "category": "Gaming", "hints": ["Lancer", "Locust", "Cover"] },
  { "id": "gaming_69", "word": "Mass Effect", "category": "Gaming", "hints": ["Shepard", "Reapers", "Normandy"] },
  { "id": "gaming_70", "word": "Dragon Age", "category": "Gaming", "hints": ["Thedas", "Blight", "Inquisition"] },
  { "id": "gaming_71", "word": "Baldurs Gate", "category": "Gaming", "hints": ["DnD", "Mind", "Flayer"] },
  { "id": "gaming_72", "word": "Divinity", "category": "Gaming", "hints": ["Original", "Sin", "Larian"] },
  { "id": "gaming_73", "word": "Diablo", "category": "Gaming", "hints": ["Loot", "Demon", "Sanctuary"] },
  { "id": "gaming_74", "word": "Path of Exile", "category": "Gaming", "hints": ["Skill", "Tree", "Wraeclast"] },
  { "id": "gaming_75", "word": "Hades", "category": "Gaming", "hints": ["Underworld", "Roguelike", "Zagreus"] },
  { "id": "gaming_76", "word": "Dead Cells", "category": "Gaming", "hints": ["Roguevania", "Prisoner", "Flask"] },
  { "id": "gaming_77", "word": "Hollow Knight", "category": "Gaming", "hints": ["Bug", "Nail", "Hallownest"] },
  { "id": "gaming_78", "word": "Ori", "category": "Gaming", "hints": ["Blind", "Forest", "Platformer"] },
  { "id": "gaming_79", "word": "Celeste", "category": "Gaming", "hints": ["Mountain", "Strawberries", "Dash"] },
  { "id": "gaming_80", "word": "Cuphead", "category": "Gaming", "hints": ["Rubber", "Hose", "Bosses"] },
  { "id": "gaming_81", "word": "Undertale", "category": "Gaming", "hints": ["Mercy", "Genocide", "Sans"] },
  { "id": "gaming_82", "word": "Deltarune", "category": "Gaming", "hints": ["Kris", "Susie", "Dark"] },
  { "id": "gaming_83", "word": "Five Nights", "category": "Gaming", "hints": ["Freddy", "Animatronics", "Jump"] },
  { "id": "gaming_84", "word": "Amnesia", "category": "Gaming", "hints": ["Dark", "Descent", "Sanity"] },
  { "id": "gaming_85", "word": "Outlast", "category": "Gaming", "hints": ["Asylum", "Camera", "Battery"] },
  { "id": "gaming_86", "word": "Alien Isolation", "category": "Gaming", "hints": ["Xenomorph", "Amanda", "Ripley"] },
  { "id": "gaming_87", "word": "Dead Space", "category": "Gaming", "hints": ["Necromorph", "Isaac", "Clarke"] },
  { "id": "gaming_88", "word": "Bioshock", "category": "Gaming", "hints": ["Rapture", "Big", "Daddy"] },
  { "id": "gaming_89", "word": "Dishonored", "category": "Gaming", "hints": ["Corvo", "Blink", "Stealth"] },
  { "id": "gaming_90", "word": "Prey", "category": "Gaming", "hints": ["Mimics", "Talos", "Space"] },
  { "id": "gaming_91", "word": "Thief", "category": "Gaming", "hints": ["Garrett", "Shadows", "Stealth"] },
  { "id": "gaming_92", "word": "Deus Ex", "category": "Gaming", "hints": ["Augmentation", "Jensen", "Conspiracy"] },
  { "id": "gaming_93", "word": "System Shock", "category": "Gaming", "hints": ["Shodan", "Hacker", "Space"] },
  { "id": "gaming_94", "word": "Hitman", "category": "Gaming", "hints": ["Agent", "Barcode", "Assassination"] },
  { "id": "gaming_95", "word": "Assassins Creed", "category": "Gaming", "hints": ["Hidden", "Blade", "Templars"] },
  { "id": "gaming_96", "word": "Far Cry", "category": "Gaming", "hints": ["Outpost", "Villain", "Jungle"] },
  { "id": "gaming_97", "word": "Watch Dogs", "category": "Gaming", "hints": ["Hacking", "Chicago", "DedSec"] },
  { "id": "gaming_98", "word": "Grand Theft Auto", "category": "Gaming", "hints": ["Cars", "Heists", "Los"] },
  { "id": "gaming_99", "word": "Red Dead", "category": "Gaming", "hints": ["Cowboy", "Arthur", "Morgan"] },
  { "id": "gaming_100", "word": "Bully", "category": "Gaming", "hints": ["School", "Jimmy", "Hopkins"] },
  { "id": "gaming_101", "word": "L.A. Noire", "category": "Gaming", "hints": ["Detective", "Doubt", "Interrogation"] },
  { "id": "gaming_102", "word": "Max Payne", "category": "Gaming", "hints": ["Bullet", "Time", "Noir"] },
  { "id": "gaming_103", "word": "Alan Wake", "category": "Gaming", "hints": ["Flashlight", "Writer", "Darkness"] },
  { "id": "gaming_104", "word": "Control", "category": "Gaming", "hints": ["Federal", "Bureau", "Telekinesis"] },
  { "id": "gaming_105", "word": "Quantum Break", "category": "Gaming", "hints": ["Time", "Stutter", "Remedy"] },
  { "id": "gaming_106", "word": "SimCity", "category": "Gaming", "hints": ["Mayor", "Zoning", "Disasters"] },
  { "id": "gaming_107", "word": "The Sims", "category": "Gaming", "hints": ["Plumbob", "Gibberish", "Pool"] },
  { "id": "gaming_108", "word": "Civilization", "category": "Gaming", "hints": ["Gandhi", "Nukes", "Turns"] },
  { "id": "gaming_109", "word": "Age of Empires", "category": "Gaming", "hints": ["Wololo", "RTS", "History"] },
  { "id": "gaming_110", "word": "Starcraft", "category": "Gaming", "hints": ["Zerg", "Protoss", "Terran"] },
  { "id": "gaming_111", "word": "Warcraft", "category": "Gaming", "hints": ["Orcs", "Humans", "Strategy"] },
  { "id": "gaming_112", "word": "Command Conquer", "category": "Gaming", "hints": ["Tiberium", "Kane", "Brotherhood"] },
  { "id": "gaming_113", "word": "RollerCoaster", "category": "Gaming", "hints": ["Tycoon", "Parks", "Vomiting"] },
  { "id": "gaming_114", "word": "Planet Coaster", "category": "Gaming", "hints": ["Simulation", "Rides", "Theme"] },
  { "id": "gaming_115", "word": "Cities Skylines", "category": "Gaming", "hints": ["Traffic", "Zoning", "Mayor"] },
  { "id": "gaming_116", "word": "Flight Simulator", "category": "Gaming", "hints": ["Planes", "Earth", "Microsoft"] },
  { "id": "gaming_117", "word": "Euro Truck", "category": "Gaming", "hints": ["Driving", "Deliveries", "Simulation"] },
  { "id": "gaming_118", "word": "Farming Simulator", "category": "Gaming", "hints": ["Tractors", "Crops", "Harvest"] },
  { "id": "gaming_119", "word": "Goat Simulator", "category": "Gaming", "hints": ["Physics", "Licking", "Chaos"] }
] as const
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/packs/gaming.ts' -Value $tsContent -Encoding UTF8

$jsonContent = @'
{
  "id": "gaming",
  "name": "Gaming",
  "emoji": "\ud83c\udfae",
  "description": "Video games, characters, and consoles.",
  "words": [
    {
      "word": "Super Mario",
      "hints": [
        "Plumber",
        "Mushroom",
        "Nintendo"
      ]
    },
    {
      "word": "Minecraft",
      "hints": [
        "Blocks",
        "Creepers",
        "Crafting"
      ]
    },
    {
      "word": "Zelda",
      "hints": [
        "Link",
        "Triforce",
        "Hyrule"
      ]
    },
    {
      "word": "Tetris",
      "hints": [
        "Blocks",
        "Puzzle",
        "Lines"
      ]
    },
    {
      "word": "Pac-Man",
      "hints": [
        "Ghosts",
        "Pellets",
        "Maze"
      ]
    },
    {
      "word": "Pokemon",
      "hints": [
        "Pikachu",
        "Catch",
        "Monsters"
      ]
    },
    {
      "word": "Halo",
      "hints": [
        "Master",
        "Chief",
        "Cortana"
      ]
    },
    {
      "word": "Fortnite",
      "hints": [
        "Battle",
        "Royale",
        "Building"
      ]
    },
    {
      "word": "Overwatch",
      "hints": [
        "Hero",
        "Shooter",
        "Blizzard"
      ]
    },
    {
      "word": "Skyrim",
      "hints": [
        "Dragons",
        "Elder",
        "Scrolls"
      ]
    },
    {
      "word": "Doom",
      "hints": [
        "Demons",
        "Mars",
        "Shotgun"
      ]
    },
    {
      "word": "Sonic",
      "hints": [
        "Hedgehog",
        "Rings",
        "Fast"
      ]
    },
    {
      "word": "Portal",
      "hints": [
        "Cake",
        "Aperture",
        "Physics"
      ]
    },
    {
      "word": "Half-Life",
      "hints": [
        "Gordon",
        "Freeman",
        "Crowbar"
      ]
    },
    {
      "word": "Roblox",
      "hints": [
        "User",
        "Created",
        "Avatars"
      ]
    },
    {
      "word": "Terraria",
      "hints": [
        "2D",
        "Mining",
        "Bosses"
      ]
    },
    {
      "word": "Among Us",
      "hints": [
        "Impostor",
        "Tasks",
        "Sus"
      ]
    },
    {
      "word": "Street Fighter",
      "hints": [
        "Ryu",
        "Hadouken",
        "Capcom"
      ]
    },
    {
      "word": "Mortal Kombat",
      "hints": [
        "Fatality",
        "Scorpion",
        "Sub-Zero"
      ]
    },
    {
      "word": "Smash Bros",
      "hints": [
        "Nintendo",
        "Fighting",
        "Crossover"
      ]
    },
    {
      "word": "Animal Crossing",
      "hints": [
        "Tom",
        "Nook",
        "Islands"
      ]
    },
    {
      "word": "Stardew Valley",
      "hints": [
        "Farming",
        "Simulation",
        "Pelican"
      ]
    },
    {
      "word": "The Witcher",
      "hints": [
        "Geralt",
        "Monster",
        "Hunter"
      ]
    },
    {
      "word": "Cyberpunk",
      "hints": [
        "Night",
        "City",
        "Keanu"
      ]
    },
    {
      "word": "Fallout",
      "hints": [
        "Vault",
        "Wasteland",
        "Pip-Boy"
      ]
    },
    {
      "word": "Dark Souls",
      "hints": [
        "Hard",
        "Bonfire",
        "Bosses"
      ]
    },
    {
      "word": "Elden Ring",
      "hints": [
        "Tarnished",
        "Maiden",
        "Tree"
      ]
    },
    {
      "word": "Bloodborne",
      "hints": [
        "Yharnam",
        "Hunters",
        "Beasts"
      ]
    },
    {
      "word": "Sekiro",
      "hints": [
        "Wolf",
        "Parry",
        "Shinobi"
      ]
    },
    {
      "word": "Persona",
      "hints": [
        "High",
        "School",
        "Shadows"
      ]
    },
    {
      "word": "Final Fantasy",
      "hints": [
        "Chocobo",
        "Moogle",
        "Crystal"
      ]
    },
    {
      "word": "Kingdom Hearts",
      "hints": [
        "Disney",
        "Keyblade",
        "Sora"
      ]
    },
    {
      "word": "Metal Gear",
      "hints": [
        "Snake",
        "Stealth",
        "Box"
      ]
    },
    {
      "word": "Resident Evil",
      "hints": [
        "Zombies",
        "Umbrella",
        "Mansion"
      ]
    },
    {
      "word": "Silent Hill",
      "hints": [
        "Fog",
        "Pyramid",
        "Radio"
      ]
    },
    {
      "word": "Castlevania",
      "hints": [
        "Dracula",
        "Vampire",
        "Whip"
      ]
    },
    {
      "word": "Metroid",
      "hints": [
        "Samus",
        "Bounty",
        "Hunter"
      ]
    },
    {
      "word": "Donkey Kong",
      "hints": [
        "Ape",
        "Barrels",
        "Bananas"
      ]
    },
    {
      "word": "Kirby",
      "hints": [
        "Pink",
        "Puffball",
        "Inhale"
      ]
    },
    {
      "word": "Star Fox",
      "hints": [
        "Arwing",
        "Barrel",
        "Roll"
      ]
    },
    {
      "word": "F-Zero",
      "hints": [
        "Captain",
        "Falcon",
        "Racing"
      ]
    },
    {
      "word": "Mario Kart",
      "hints": [
        "Blue",
        "Shell",
        "Racing"
      ]
    },
    {
      "word": "Mario Party",
      "hints": [
        "Board",
        "Game",
        "Minigames"
      ]
    },
    {
      "word": "Splatoon",
      "hints": [
        "Squid",
        "Ink",
        "Paint"
      ]
    },
    {
      "word": "Pikmin",
      "hints": [
        "Plant",
        "Creatures",
        "Olimar"
      ]
    },
    {
      "word": "Fire Emblem",
      "hints": [
        "Tactics",
        "Grid",
        "Permadeath"
      ]
    },
    {
      "word": "Xenoblade",
      "hints": [
        "Monado",
        "Shulk",
        "Titan"
      ]
    },
    {
      "word": "EarthBound",
      "hints": [
        "Ness",
        "PSI",
        "Mother"
      ]
    },
    {
      "word": "Chrono Trigger",
      "hints": [
        "Time",
        "Travel",
        "Lavos"
      ]
    },
    {
      "word": "Secret of Mana",
      "hints": [
        "Tree",
        "Action",
        "RPG"
      ]
    },
    {
      "word": "Dragon Quest",
      "hints": [
        "Slime",
        "Hero",
        "Turn-Based"
      ]
    },
    {
      "word": "Monster Hunter",
      "hints": [
        "Rathalos",
        "Wyvern",
        "Weapons"
      ]
    },
    {
      "word": "Genshin Impact",
      "hints": [
        "Gacha",
        "Anime",
        "Traveler"
      ]
    },
    {
      "word": "League of Legends",
      "hints": [
        "MOBA",
        "Riot",
        "Champions"
      ]
    },
    {
      "word": "Dota 2",
      "hints": [
        "Valve",
        "Defense",
        "Ancients"
      ]
    },
    {
      "word": "World of Warcraft",
      "hints": [
        "Alliance",
        "Horde",
        "MMO"
      ]
    },
    {
      "word": "Runescape",
      "hints": [
        "Grinding",
        "Gielinor",
        "Woodcutting"
      ]
    },
    {
      "word": "Guild Wars",
      "hints": [
        "Tyria",
        "Events",
        "MMORPG"
      ]
    },
    {
      "word": "Destiny",
      "hints": [
        "Guardians",
        "Ghost",
        "Traveler"
      ]
    },
    {
      "word": "Warframe",
      "hints": [
        "Tenno",
        "Ninjas",
        "Space"
      ]
    },
    {
      "word": "Apex Legends",
      "hints": [
        "Hero",
        "Battle",
        "Royale"
      ]
    },
    {
      "word": "PUBG",
      "hints": [
        "Chicken",
        "Dinner",
        "Pan"
      ]
    },
    {
      "word": "Valorant",
      "hints": [
        "Agents",
        "Spike",
        "Tactical"
      ]
    },
    {
      "word": "CSGO",
      "hints": [
        "Terrorist",
        "Counter",
        "Bomb"
      ]
    },
    {
      "word": "Rainbow Six",
      "hints": [
        "Siege",
        "Operators",
        "Destruction"
      ]
    },
    {
      "word": "Call of Duty",
      "hints": [
        "Warzone",
        "Zombies",
        "Shooter"
      ]
    },
    {
      "word": "Battlefield",
      "hints": [
        "Levolution",
        "Vehicles",
        "Conquest"
      ]
    },
    {
      "word": "Gears of War",
      "hints": [
        "Lancer",
        "Locust",
        "Cover"
      ]
    },
    {
      "word": "Mass Effect",
      "hints": [
        "Shepard",
        "Reapers",
        "Normandy"
      ]
    },
    {
      "word": "Dragon Age",
      "hints": [
        "Thedas",
        "Blight",
        "Inquisition"
      ]
    },
    {
      "word": "Baldurs Gate",
      "hints": [
        "DnD",
        "Mind",
        "Flayer"
      ]
    },
    {
      "word": "Divinity",
      "hints": [
        "Original",
        "Sin",
        "Larian"
      ]
    },
    {
      "word": "Diablo",
      "hints": [
        "Loot",
        "Demon",
        "Sanctuary"
      ]
    },
    {
      "word": "Path of Exile",
      "hints": [
        "Skill",
        "Tree",
        "Wraeclast"
      ]
    },
    {
      "word": "Hades",
      "hints": [
        "Underworld",
        "Roguelike",
        "Zagreus"
      ]
    },
    {
      "word": "Dead Cells",
      "hints": [
        "Roguevania",
        "Prisoner",
        "Flask"
      ]
    },
    {
      "word": "Hollow Knight",
      "hints": [
        "Bug",
        "Nail",
        "Hallownest"
      ]
    },
    {
      "word": "Ori",
      "hints": [
        "Blind",
        "Forest",
        "Platformer"
      ]
    },
    {
      "word": "Celeste",
      "hints": [
        "Mountain",
        "Strawberries",
        "Dash"
      ]
    },
    {
      "word": "Cuphead",
      "hints": [
        "Rubber",
        "Hose",
        "Bosses"
      ]
    },
    {
      "word": "Undertale",
      "hints": [
        "Mercy",
        "Genocide",
        "Sans"
      ]
    },
    {
      "word": "Deltarune",
      "hints": [
        "Kris",
        "Susie",
        "Dark"
      ]
    },
    {
      "word": "Five Nights",
      "hints": [
        "Freddy",
        "Animatronics",
        "Jump"
      ]
    },
    {
      "word": "Amnesia",
      "hints": [
        "Dark",
        "Descent",
        "Sanity"
      ]
    },
    {
      "word": "Outlast",
      "hints": [
        "Asylum",
        "Camera",
        "Battery"
      ]
    },
    {
      "word": "Alien Isolation",
      "hints": [
        "Xenomorph",
        "Amanda",
        "Ripley"
      ]
    },
    {
      "word": "Dead Space",
      "hints": [
        "Necromorph",
        "Isaac",
        "Clarke"
      ]
    },
    {
      "word": "Bioshock",
      "hints": [
        "Rapture",
        "Big",
        "Daddy"
      ]
    },
    {
      "word": "Dishonored",
      "hints": [
        "Corvo",
        "Blink",
        "Stealth"
      ]
    },
    {
      "word": "Prey",
      "hints": [
        "Mimics",
        "Talos",
        "Space"
      ]
    },
    {
      "word": "Thief",
      "hints": [
        "Garrett",
        "Shadows",
        "Stealth"
      ]
    },
    {
      "word": "Deus Ex",
      "hints": [
        "Augmentation",
        "Jensen",
        "Conspiracy"
      ]
    },
    {
      "word": "System Shock",
      "hints": [
        "Shodan",
        "Hacker",
        "Space"
      ]
    },
    {
      "word": "Hitman",
      "hints": [
        "Agent",
        "Barcode",
        "Assassination"
      ]
    },
    {
      "word": "Assassins Creed",
      "hints": [
        "Hidden",
        "Blade",
        "Templars"
      ]
    },
    {
      "word": "Far Cry",
      "hints": [
        "Outpost",
        "Villain",
        "Jungle"
      ]
    },
    {
      "word": "Watch Dogs",
      "hints": [
        "Hacking",
        "Chicago",
        "DedSec"
      ]
    },
    {
      "word": "Grand Theft Auto",
      "hints": [
        "Cars",
        "Heists",
        "Los"
      ]
    },
    {
      "word": "Red Dead",
      "hints": [
        "Cowboy",
        "Arthur",
        "Morgan"
      ]
    },
    {
      "word": "Bully",
      "hints": [
        "School",
        "Jimmy",
        "Hopkins"
      ]
    },
    {
      "word": "L.A. Noire",
      "hints": [
        "Detective",
        "Doubt",
        "Interrogation"
      ]
    },
    {
      "word": "Max Payne",
      "hints": [
        "Bullet",
        "Time",
        "Noir"
      ]
    },
    {
      "word": "Alan Wake",
      "hints": [
        "Flashlight",
        "Writer",
        "Darkness"
      ]
    },
    {
      "word": "Control",
      "hints": [
        "Federal",
        "Bureau",
        "Telekinesis"
      ]
    },
    {
      "word": "Quantum Break",
      "hints": [
        "Time",
        "Stutter",
        "Remedy"
      ]
    },
    {
      "word": "SimCity",
      "hints": [
        "Mayor",
        "Zoning",
        "Disasters"
      ]
    },
    {
      "word": "The Sims",
      "hints": [
        "Plumbob",
        "Gibberish",
        "Pool"
      ]
    },
    {
      "word": "Civilization",
      "hints": [
        "Gandhi",
        "Nukes",
        "Turns"
      ]
    },
    {
      "word": "Age of Empires",
      "hints": [
        "Wololo",
        "RTS",
        "History"
      ]
    },
    {
      "word": "Starcraft",
      "hints": [
        "Zerg",
        "Protoss",
        "Terran"
      ]
    },
    {
      "word": "Warcraft",
      "hints": [
        "Orcs",
        "Humans",
        "Strategy"
      ]
    },
    {
      "word": "Command Conquer",
      "hints": [
        "Tiberium",
        "Kane",
        "Brotherhood"
      ]
    },
    {
      "word": "RollerCoaster",
      "hints": [
        "Tycoon",
        "Parks",
        "Vomiting"
      ]
    },
    {
      "word": "Planet Coaster",
      "hints": [
        "Simulation",
        "Rides",
        "Theme"
      ]
    },
    {
      "word": "Cities Skylines",
      "hints": [
        "Traffic",
        "Zoning",
        "Mayor"
      ]
    },
    {
      "word": "Flight Simulator",
      "hints": [
        "Planes",
        "Earth",
        "Microsoft"
      ]
    },
    {
      "word": "Euro Truck",
      "hints": [
        "Driving",
        "Deliveries",
        "Simulation"
      ]
    },
    {
      "word": "Farming Simulator",
      "hints": [
        "Tractors",
        "Crops",
        "Harvest"
      ]
    },
    {
      "word": "Goat Simulator",
      "hints": [
        "Physics",
        "Licking",
        "Chaos"
      ]
    }
  ]
}
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/gaming.json' -Value $jsonContent -Encoding UTF8

$tsContent = @'
import type { WordEntry } from '../../../types/packs'

export const GEOGRAPHY_PACK: WordEntry[] = [
  { "id": "geography_1", "word": "Mount Everest", "category": "Geography", "hints": ["Highest", "Peak", "Himalayas"] },
  { "id": "geography_2", "word": "Grand Canyon", "category": "Geography", "hints": ["Arizona", "River", "Gorge"] },
  { "id": "geography_3", "word": "Amazon River", "category": "Geography", "hints": ["South", "America", "Rainforest"] },
  { "id": "geography_4", "word": "Sahara", "category": "Geography", "hints": ["Desert", "Africa", "Sand"] },
  { "id": "geography_5", "word": "Antarctica", "category": "Geography", "hints": ["Ice", "Penguins", "South"] },
  { "id": "geography_6", "word": "Pacific Ocean", "category": "Geography", "hints": ["Largest", "Water", "Ring"] },
  { "id": "geography_7", "word": "Atlantic Ocean", "category": "Geography", "hints": ["Ocean", "Titanic", "Gulf"] },
  { "id": "geography_8", "word": "Indian Ocean", "category": "Geography", "hints": ["Water", "Asia", "Africa"] },
  { "id": "geography_9", "word": "Arctic Ocean", "category": "Geography", "hints": ["North", "Pole", "Ice"] },
  { "id": "geography_10", "word": "Mediterranean", "category": "Geography", "hints": ["Sea", "Europe", "Africa"] },
  { "id": "geography_11", "word": "Caribbean", "category": "Geography", "hints": ["Islands", "Pirates", "Sea"] },
  { "id": "geography_12", "word": "Alps", "category": "Geography", "hints": ["Mountains", "Europe", "Skiing"] },
  { "id": "geography_13", "word": "Andes", "category": "Geography", "hints": ["Mountains", "South", "America"] },
  { "id": "geography_14", "word": "Rocky Mountains", "category": "Geography", "hints": ["North", "America", "Range"] },
  { "id": "geography_15", "word": "Himalayas", "category": "Geography", "hints": ["Asia", "Mountains", "Nepal"] },
  { "id": "geography_16", "word": "Nile", "category": "Geography", "hints": ["River", "Egypt", "Longest"] },
  { "id": "geography_17", "word": "Mississippi", "category": "Geography", "hints": ["River", "USA", "Delta"] },
  { "id": "geography_18", "word": "Yangtze", "category": "Geography", "hints": ["River", "China", "Dam"] },
  { "id": "geography_19", "word": "Ganges", "category": "Geography", "hints": ["River", "India", "Holy"] },
  { "id": "geography_20", "word": "Thames", "category": "Geography", "hints": ["River", "London", "England"] },
  { "id": "geography_21", "word": "Seine", "category": "Geography", "hints": ["River", "Paris", "France"] },
  { "id": "geography_22", "word": "Danube", "category": "Geography", "hints": ["River", "Europe", "Waltz"] },
  { "id": "geography_23", "word": "Amazon Rainforest", "category": "Geography", "hints": ["Trees", "Brazil", "Lungs"] },
  { "id": "geography_24", "word": "Great Barrier", "category": "Geography", "hints": ["Reef", "Australia", "Coral"] },
  { "id": "geography_25", "word": "Galapagos", "category": "Geography", "hints": ["Islands", "Darwin", "Turtles"] },
  { "id": "geography_26", "word": "Madagascar", "category": "Geography", "hints": ["Island", "Africa", "Lemurs"] },
  { "id": "geography_27", "word": "Greenland", "category": "Geography", "hints": ["Island", "Ice", "Denmark"] },
  { "id": "geography_28", "word": "Iceland", "category": "Geography", "hints": ["Fire", "Ice", "Reykjavik"] },
  { "id": "geography_29", "word": "New Zealand", "category": "Geography", "hints": ["Kiwis", "Hobbits", "Islands"] },
  { "id": "geography_30", "word": "Japan", "category": "Geography", "hints": ["Tokyo", "Islands", "Sushi"] },
  { "id": "geography_31", "word": "United Kingdom", "category": "Geography", "hints": ["Britain", "London", "Queen"] },
  { "id": "geography_32", "word": "Ireland", "category": "Geography", "hints": ["Emerald", "Isle", "Dublin"] },
  { "id": "geography_33", "word": "Cuba", "category": "Geography", "hints": ["Havana", "Cigars", "Island"] },
  { "id": "geography_34", "word": "Jamaica", "category": "Geography", "hints": ["Reggae", "Island", "Caribbean"] },
  { "id": "geography_35", "word": "Hawaii", "category": "Geography", "hints": ["Aloha", "Volcanoes", "Islands"] },
  { "id": "geography_36", "word": "Fiji", "category": "Geography", "hints": ["Water", "Island", "Pacific"] },
  { "id": "geography_37", "word": "Bermuda", "category": "Geography", "hints": ["Triangle", "Shorts", "Island"] },
  { "id": "geography_38", "word": "Bahamas", "category": "Geography", "hints": ["Nassau", "Beaches", "Islands"] },
  { "id": "geography_39", "word": "Maldives", "category": "Geography", "hints": ["Atolls", "Ocean", "Resorts"] },
  { "id": "geography_40", "word": "Seychelles", "category": "Geography", "hints": ["Islands", "Africa", "Ocean"] },
  { "id": "geography_41", "word": "Sri Lanka", "category": "Geography", "hints": ["Ceylon", "Tea", "Island"] },
  { "id": "geography_42", "word": "Taiwan", "category": "Geography", "hints": ["Taipei", "Island", "Asia"] },
  { "id": "geography_43", "word": "Philippines", "category": "Geography", "hints": ["Manila", "Islands", "Asia"] },
  { "id": "geography_44", "word": "Indonesia", "category": "Geography", "hints": ["Jakarta", "Islands", "Bali"] },
  { "id": "geography_45", "word": "Malaysia", "category": "Geography", "hints": ["Kuala", "Lumpur", "Asia"] },
  { "id": "geography_46", "word": "Singapore", "category": "Geography", "hints": ["City", "State", "Asia"] },
  { "id": "geography_47", "word": "Thailand", "category": "Geography", "hints": ["Bangkok", "Asia", "Elephants"] },
  { "id": "geography_48", "word": "Vietnam", "category": "Geography", "hints": ["Hanoi", "Pho", "Asia"] },
  { "id": "geography_49", "word": "Cambodia", "category": "Geography", "hints": ["Angkor", "Wat", "Asia"] },
  { "id": "geography_50", "word": "Laos", "category": "Geography", "hints": ["Landlocked", "Asia", "Vientiane"] },
  { "id": "geography_51", "word": "Myanmar", "category": "Geography", "hints": ["Burma", "Asia", "Yangon"] },
  { "id": "geography_52", "word": "India", "category": "Geography", "hints": ["Taj", "Mahal", "Delhi"] },
  { "id": "geography_53", "word": "Pakistan", "category": "Geography", "hints": ["Islamabad", "Asia", "K2"] },
  { "id": "geography_54", "word": "Bangladesh", "category": "Geography", "hints": ["Dhaka", "Asia", "Tigers"] },
  { "id": "geography_55", "word": "Nepal", "category": "Geography", "hints": ["Kathmandu", "Everest", "Sherpas"] },
  { "id": "geography_56", "word": "Bhutan", "category": "Geography", "hints": ["Thimphu", "Dragons", "Happiness"] },
  { "id": "geography_57", "word": "China", "category": "Geography", "hints": ["Wall", "Beijing", "Pandas"] },
  { "id": "geography_58", "word": "Mongolia", "category": "Geography", "hints": ["Ulaanbaatar", "Genghis", "Khan"] },
  { "id": "geography_59", "word": "South Korea", "category": "Geography", "hints": ["Seoul", "K-Pop", "Asia"] },
  { "id": "geography_60", "word": "North Korea", "category": "Geography", "hints": ["Pyongyang", "Kim", "Asia"] },
  { "id": "geography_61", "word": "Russia", "category": "Geography", "hints": ["Moscow", "Vodka", "Largest"] },
  { "id": "geography_62", "word": "Kazakhstan", "category": "Geography", "hints": ["Astana", "Borat", "Asia"] },
  { "id": "geography_63", "word": "Uzbekistan", "category": "Geography", "hints": ["Tashkent", "Silk", "Road"] },
  { "id": "geography_64", "word": "Turkmenistan", "category": "Geography", "hints": ["Ashgabat", "Desert", "Asia"] },
  { "id": "geography_65", "word": "Kyrgyzstan", "category": "Geography", "hints": ["Bishkek", "Mountains", "Asia"] },
  { "id": "geography_66", "word": "Tajikistan", "category": "Geography", "hints": ["Dushanbe", "Mountains", "Asia"] },
  { "id": "geography_67", "word": "Afghanistan", "category": "Geography", "hints": ["Kabul", "Mountains", "Asia"] },
  { "id": "geography_68", "word": "Iran", "category": "Geography", "hints": ["Tehran", "Persia", "Middle"] },
  { "id": "geography_69", "word": "Iraq", "category": "Geography", "hints": ["Baghdad", "Mesopotamia", "Middle"] },
  { "id": "geography_70", "word": "Syria", "category": "Geography", "hints": ["Damascus", "Middle", "East"] },
  { "id": "geography_71", "word": "Lebanon", "category": "Geography", "hints": ["Beirut", "Cedars", "Middle"] },
  { "id": "geography_72", "word": "Israel", "category": "Geography", "hints": ["Jerusalem", "Middle", "East"] },
  { "id": "geography_73", "word": "Jordan", "category": "Geography", "hints": ["Amman", "Petra", "Middle"] },
  { "id": "geography_74", "word": "Saudi Arabia", "category": "Geography", "hints": ["Riyadh", "Mecca", "Oil"] },
  { "id": "geography_75", "word": "Yemen", "category": "Geography", "hints": ["Sanaa", "Middle", "East"] },
  { "id": "geography_76", "word": "Oman", "category": "Geography", "hints": ["Muscat", "Middle", "East"] },
  { "id": "geography_77", "word": "United Arab", "category": "Geography", "hints": ["Emirates", "Dubai", "Abu"] },
  { "id": "geography_78", "word": "Qatar", "category": "Geography", "hints": ["Doha", "Middle", "East"] },
  { "id": "geography_79", "word": "Kuwait", "category": "Geography", "hints": ["City", "Middle", "East"] },
  { "id": "geography_80", "word": "Bahrain", "category": "Geography", "hints": ["Manama", "Middle", "East"] },
  { "id": "geography_81", "word": "Turkey", "category": "Geography", "hints": ["Istanbul", "Ankara", "Europe"] },
  { "id": "geography_82", "word": "Greece", "category": "Geography", "hints": ["Athens", "Mythology", "Europe"] },
  { "id": "geography_83", "word": "Italy", "category": "Geography", "hints": ["Rome", "Pizza", "Boot"] },
  { "id": "geography_84", "word": "Spain", "category": "Geography", "hints": ["Madrid", "Tapas", "Europe"] },
  { "id": "geography_85", "word": "Portugal", "category": "Geography", "hints": ["Lisbon", "Europe", "Iberian"] },
  { "id": "geography_86", "word": "France", "category": "Geography", "hints": ["Paris", "Eiffel", "Wine"] },
  { "id": "geography_87", "word": "Germany", "category": "Geography", "hints": ["Berlin", "Beer", "Europe"] },
  { "id": "geography_88", "word": "Poland", "category": "Geography", "hints": ["Warsaw", "Europe", "Pierogi"] },
  { "id": "geography_89", "word": "Ukraine", "category": "Geography", "hints": ["Kyiv", "Europe", "Sunflower"] },
  { "id": "geography_90", "word": "Belarus", "category": "Geography", "hints": ["Minsk", "Europe", "Tractors"] },
  { "id": "geography_91", "word": "Romania", "category": "Geography", "hints": ["Bucharest", "Dracula", "Europe"] },
  { "id": "geography_92", "word": "Bulgaria", "category": "Geography", "hints": ["Sofia", "Europe", "Balkans"] },
  { "id": "geography_93", "word": "Serbia", "category": "Geography", "hints": ["Belgrade", "Europe", "Balkans"] },
  { "id": "geography_94", "word": "Croatia", "category": "Geography", "hints": ["Zagreb", "Europe", "Balkans"] },
  { "id": "geography_95", "word": "Bosnia", "category": "Geography", "hints": ["Sarajevo", "Europe", "Balkans"] },
  { "id": "geography_96", "word": "Slovenia", "category": "Geography", "hints": ["Ljubljana", "Europe", "Balkans"] },
  { "id": "geography_97", "word": "Slovakia", "category": "Geography", "hints": ["Bratislava", "Europe", "Castles"] },
  { "id": "geography_98", "word": "Czechia", "category": "Geography", "hints": ["Prague", "Europe", "Beer"] },
  { "id": "geography_99", "word": "Austria", "category": "Geography", "hints": ["Vienna", "Europe", "Alps"] },
  { "id": "geography_100", "word": "Switzerland", "category": "Geography", "hints": ["Bern", "Alps", "Chocolate"] },
  { "id": "geography_101", "word": "Netherlands", "category": "Geography", "hints": ["Amsterdam", "Tulips", "Europe"] },
  { "id": "geography_102", "word": "Belgium", "category": "Geography", "hints": ["Brussels", "Waffles", "Europe"] },
  { "id": "geography_103", "word": "Sweden", "category": "Geography", "hints": ["Stockholm", "IKEA", "Europe"] },
  { "id": "geography_104", "word": "Norway", "category": "Geography", "hints": ["Oslo", "Fjords", "Europe"] },
  { "id": "geography_105", "word": "Denmark", "category": "Geography", "hints": ["Copenhagen", "Lego", "Europe"] },
  { "id": "geography_106", "word": "Finland", "category": "Geography", "hints": ["Helsinki", "Saunas", "Europe"] },
  { "id": "geography_107", "word": "Estonia", "category": "Geography", "hints": ["Tallinn", "Europe", "Baltic"] },
  { "id": "geography_108", "word": "Latvia", "category": "Geography", "hints": ["Riga", "Europe", "Baltic"] },
  { "id": "geography_109", "word": "Lithuania", "category": "Geography", "hints": ["Vilnius", "Europe", "Baltic"] },
  { "id": "geography_110", "word": "Canada", "category": "Geography", "hints": ["Ottawa", "Maple", "Moose"] },
  { "id": "geography_111", "word": "United States", "category": "Geography", "hints": ["Washington", "Eagles", "States"] },
  { "id": "geography_112", "word": "Mexico", "category": "Geography", "hints": ["City", "Tacos", "America"] },
  { "id": "geography_113", "word": "Guatemala", "category": "Geography", "hints": ["City", "Maya", "America"] },
  { "id": "geography_114", "word": "Belize", "category": "Geography", "hints": ["Belmopan", "America", "Reef"] },
  { "id": "geography_115", "word": "Honduras", "category": "Geography", "hints": ["Tegucigalpa", "America", "Central"] },
  { "id": "geography_116", "word": "El Salvador", "category": "Geography", "hints": ["San", "Salvador", "America"] },
  { "id": "geography_117", "word": "Nicaragua", "category": "Geography", "hints": ["Managua", "America", "Central"] },
  { "id": "geography_118", "word": "Costa Rica", "category": "Geography", "hints": ["San", "Jose", "Pura"] },
  { "id": "geography_119", "word": "Panama", "category": "Geography", "hints": ["Canal", "America", "Central"] }
] as const
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/packs/geography.ts' -Value $tsContent -Encoding UTF8

$jsonContent = @'
{
  "id": "geography",
  "name": "Geography",
  "emoji": "\ud83c\udf0d",
  "description": "Countries, cities, and natural wonders.",
  "words": [
    {
      "word": "Mount Everest",
      "hints": [
        "Highest",
        "Peak",
        "Himalayas"
      ]
    },
    {
      "word": "Grand Canyon",
      "hints": [
        "Arizona",
        "River",
        "Gorge"
      ]
    },
    {
      "word": "Amazon River",
      "hints": [
        "South",
        "America",
        "Rainforest"
      ]
    },
    {
      "word": "Sahara",
      "hints": [
        "Desert",
        "Africa",
        "Sand"
      ]
    },
    {
      "word": "Antarctica",
      "hints": [
        "Ice",
        "Penguins",
        "South"
      ]
    },
    {
      "word": "Pacific Ocean",
      "hints": [
        "Largest",
        "Water",
        "Ring"
      ]
    },
    {
      "word": "Atlantic Ocean",
      "hints": [
        "Ocean",
        "Titanic",
        "Gulf"
      ]
    },
    {
      "word": "Indian Ocean",
      "hints": [
        "Water",
        "Asia",
        "Africa"
      ]
    },
    {
      "word": "Arctic Ocean",
      "hints": [
        "North",
        "Pole",
        "Ice"
      ]
    },
    {
      "word": "Mediterranean",
      "hints": [
        "Sea",
        "Europe",
        "Africa"
      ]
    },
    {
      "word": "Caribbean",
      "hints": [
        "Islands",
        "Pirates",
        "Sea"
      ]
    },
    {
      "word": "Alps",
      "hints": [
        "Mountains",
        "Europe",
        "Skiing"
      ]
    },
    {
      "word": "Andes",
      "hints": [
        "Mountains",
        "South",
        "America"
      ]
    },
    {
      "word": "Rocky Mountains",
      "hints": [
        "North",
        "America",
        "Range"
      ]
    },
    {
      "word": "Himalayas",
      "hints": [
        "Asia",
        "Mountains",
        "Nepal"
      ]
    },
    {
      "word": "Nile",
      "hints": [
        "River",
        "Egypt",
        "Longest"
      ]
    },
    {
      "word": "Mississippi",
      "hints": [
        "River",
        "USA",
        "Delta"
      ]
    },
    {
      "word": "Yangtze",
      "hints": [
        "River",
        "China",
        "Dam"
      ]
    },
    {
      "word": "Ganges",
      "hints": [
        "River",
        "India",
        "Holy"
      ]
    },
    {
      "word": "Thames",
      "hints": [
        "River",
        "London",
        "England"
      ]
    },
    {
      "word": "Seine",
      "hints": [
        "River",
        "Paris",
        "France"
      ]
    },
    {
      "word": "Danube",
      "hints": [
        "River",
        "Europe",
        "Waltz"
      ]
    },
    {
      "word": "Amazon Rainforest",
      "hints": [
        "Trees",
        "Brazil",
        "Lungs"
      ]
    },
    {
      "word": "Great Barrier",
      "hints": [
        "Reef",
        "Australia",
        "Coral"
      ]
    },
    {
      "word": "Galapagos",
      "hints": [
        "Islands",
        "Darwin",
        "Turtles"
      ]
    },
    {
      "word": "Madagascar",
      "hints": [
        "Island",
        "Africa",
        "Lemurs"
      ]
    },
    {
      "word": "Greenland",
      "hints": [
        "Island",
        "Ice",
        "Denmark"
      ]
    },
    {
      "word": "Iceland",
      "hints": [
        "Fire",
        "Ice",
        "Reykjavik"
      ]
    },
    {
      "word": "New Zealand",
      "hints": [
        "Kiwis",
        "Hobbits",
        "Islands"
      ]
    },
    {
      "word": "Japan",
      "hints": [
        "Tokyo",
        "Islands",
        "Sushi"
      ]
    },
    {
      "word": "United Kingdom",
      "hints": [
        "Britain",
        "London",
        "Queen"
      ]
    },
    {
      "word": "Ireland",
      "hints": [
        "Emerald",
        "Isle",
        "Dublin"
      ]
    },
    {
      "word": "Cuba",
      "hints": [
        "Havana",
        "Cigars",
        "Island"
      ]
    },
    {
      "word": "Jamaica",
      "hints": [
        "Reggae",
        "Island",
        "Caribbean"
      ]
    },
    {
      "word": "Hawaii",
      "hints": [
        "Aloha",
        "Volcanoes",
        "Islands"
      ]
    },
    {
      "word": "Fiji",
      "hints": [
        "Water",
        "Island",
        "Pacific"
      ]
    },
    {
      "word": "Bermuda",
      "hints": [
        "Triangle",
        "Shorts",
        "Island"
      ]
    },
    {
      "word": "Bahamas",
      "hints": [
        "Nassau",
        "Beaches",
        "Islands"
      ]
    },
    {
      "word": "Maldives",
      "hints": [
        "Atolls",
        "Ocean",
        "Resorts"
      ]
    },
    {
      "word": "Seychelles",
      "hints": [
        "Islands",
        "Africa",
        "Ocean"
      ]
    },
    {
      "word": "Sri Lanka",
      "hints": [
        "Ceylon",
        "Tea",
        "Island"
      ]
    },
    {
      "word": "Taiwan",
      "hints": [
        "Taipei",
        "Island",
        "Asia"
      ]
    },
    {
      "word": "Philippines",
      "hints": [
        "Manila",
        "Islands",
        "Asia"
      ]
    },
    {
      "word": "Indonesia",
      "hints": [
        "Jakarta",
        "Islands",
        "Bali"
      ]
    },
    {
      "word": "Malaysia",
      "hints": [
        "Kuala",
        "Lumpur",
        "Asia"
      ]
    },
    {
      "word": "Singapore",
      "hints": [
        "City",
        "State",
        "Asia"
      ]
    },
    {
      "word": "Thailand",
      "hints": [
        "Bangkok",
        "Asia",
        "Elephants"
      ]
    },
    {
      "word": "Vietnam",
      "hints": [
        "Hanoi",
        "Pho",
        "Asia"
      ]
    },
    {
      "word": "Cambodia",
      "hints": [
        "Angkor",
        "Wat",
        "Asia"
      ]
    },
    {
      "word": "Laos",
      "hints": [
        "Landlocked",
        "Asia",
        "Vientiane"
      ]
    },
    {
      "word": "Myanmar",
      "hints": [
        "Burma",
        "Asia",
        "Yangon"
      ]
    },
    {
      "word": "India",
      "hints": [
        "Taj",
        "Mahal",
        "Delhi"
      ]
    },
    {
      "word": "Pakistan",
      "hints": [
        "Islamabad",
        "Asia",
        "K2"
      ]
    },
    {
      "word": "Bangladesh",
      "hints": [
        "Dhaka",
        "Asia",
        "Tigers"
      ]
    },
    {
      "word": "Nepal",
      "hints": [
        "Kathmandu",
        "Everest",
        "Sherpas"
      ]
    },
    {
      "word": "Bhutan",
      "hints": [
        "Thimphu",
        "Dragons",
        "Happiness"
      ]
    },
    {
      "word": "China",
      "hints": [
        "Wall",
        "Beijing",
        "Pandas"
      ]
    },
    {
      "word": "Mongolia",
      "hints": [
        "Ulaanbaatar",
        "Genghis",
        "Khan"
      ]
    },
    {
      "word": "South Korea",
      "hints": [
        "Seoul",
        "K-Pop",
        "Asia"
      ]
    },
    {
      "word": "North Korea",
      "hints": [
        "Pyongyang",
        "Kim",
        "Asia"
      ]
    },
    {
      "word": "Russia",
      "hints": [
        "Moscow",
        "Vodka",
        "Largest"
      ]
    },
    {
      "word": "Kazakhstan",
      "hints": [
        "Astana",
        "Borat",
        "Asia"
      ]
    },
    {
      "word": "Uzbekistan",
      "hints": [
        "Tashkent",
        "Silk",
        "Road"
      ]
    },
    {
      "word": "Turkmenistan",
      "hints": [
        "Ashgabat",
        "Desert",
        "Asia"
      ]
    },
    {
      "word": "Kyrgyzstan",
      "hints": [
        "Bishkek",
        "Mountains",
        "Asia"
      ]
    },
    {
      "word": "Tajikistan",
      "hints": [
        "Dushanbe",
        "Mountains",
        "Asia"
      ]
    },
    {
      "word": "Afghanistan",
      "hints": [
        "Kabul",
        "Mountains",
        "Asia"
      ]
    },
    {
      "word": "Iran",
      "hints": [
        "Tehran",
        "Persia",
        "Middle"
      ]
    },
    {
      "word": "Iraq",
      "hints": [
        "Baghdad",
        "Mesopotamia",
        "Middle"
      ]
    },
    {
      "word": "Syria",
      "hints": [
        "Damascus",
        "Middle",
        "East"
      ]
    },
    {
      "word": "Lebanon",
      "hints": [
        "Beirut",
        "Cedars",
        "Middle"
      ]
    },
    {
      "word": "Israel",
      "hints": [
        "Jerusalem",
        "Middle",
        "East"
      ]
    },
    {
      "word": "Jordan",
      "hints": [
        "Amman",
        "Petra",
        "Middle"
      ]
    },
    {
      "word": "Saudi Arabia",
      "hints": [
        "Riyadh",
        "Mecca",
        "Oil"
      ]
    },
    {
      "word": "Yemen",
      "hints": [
        "Sanaa",
        "Middle",
        "East"
      ]
    },
    {
      "word": "Oman",
      "hints": [
        "Muscat",
        "Middle",
        "East"
      ]
    },
    {
      "word": "United Arab",
      "hints": [
        "Emirates",
        "Dubai",
        "Abu"
      ]
    },
    {
      "word": "Qatar",
      "hints": [
        "Doha",
        "Middle",
        "East"
      ]
    },
    {
      "word": "Kuwait",
      "hints": [
        "City",
        "Middle",
        "East"
      ]
    },
    {
      "word": "Bahrain",
      "hints": [
        "Manama",
        "Middle",
        "East"
      ]
    },
    {
      "word": "Turkey",
      "hints": [
        "Istanbul",
        "Ankara",
        "Europe"
      ]
    },
    {
      "word": "Greece",
      "hints": [
        "Athens",
        "Mythology",
        "Europe"
      ]
    },
    {
      "word": "Italy",
      "hints": [
        "Rome",
        "Pizza",
        "Boot"
      ]
    },
    {
      "word": "Spain",
      "hints": [
        "Madrid",
        "Tapas",
        "Europe"
      ]
    },
    {
      "word": "Portugal",
      "hints": [
        "Lisbon",
        "Europe",
        "Iberian"
      ]
    },
    {
      "word": "France",
      "hints": [
        "Paris",
        "Eiffel",
        "Wine"
      ]
    },
    {
      "word": "Germany",
      "hints": [
        "Berlin",
        "Beer",
        "Europe"
      ]
    },
    {
      "word": "Poland",
      "hints": [
        "Warsaw",
        "Europe",
        "Pierogi"
      ]
    },
    {
      "word": "Ukraine",
      "hints": [
        "Kyiv",
        "Europe",
        "Sunflower"
      ]
    },
    {
      "word": "Belarus",
      "hints": [
        "Minsk",
        "Europe",
        "Tractors"
      ]
    },
    {
      "word": "Romania",
      "hints": [
        "Bucharest",
        "Dracula",
        "Europe"
      ]
    },
    {
      "word": "Bulgaria",
      "hints": [
        "Sofia",
        "Europe",
        "Balkans"
      ]
    },
    {
      "word": "Serbia",
      "hints": [
        "Belgrade",
        "Europe",
        "Balkans"
      ]
    },
    {
      "word": "Croatia",
      "hints": [
        "Zagreb",
        "Europe",
        "Balkans"
      ]
    },
    {
      "word": "Bosnia",
      "hints": [
        "Sarajevo",
        "Europe",
        "Balkans"
      ]
    },
    {
      "word": "Slovenia",
      "hints": [
        "Ljubljana",
        "Europe",
        "Balkans"
      ]
    },
    {
      "word": "Slovakia",
      "hints": [
        "Bratislava",
        "Europe",
        "Castles"
      ]
    },
    {
      "word": "Czechia",
      "hints": [
        "Prague",
        "Europe",
        "Beer"
      ]
    },
    {
      "word": "Austria",
      "hints": [
        "Vienna",
        "Europe",
        "Alps"
      ]
    },
    {
      "word": "Switzerland",
      "hints": [
        "Bern",
        "Alps",
        "Chocolate"
      ]
    },
    {
      "word": "Netherlands",
      "hints": [
        "Amsterdam",
        "Tulips",
        "Europe"
      ]
    },
    {
      "word": "Belgium",
      "hints": [
        "Brussels",
        "Waffles",
        "Europe"
      ]
    },
    {
      "word": "Sweden",
      "hints": [
        "Stockholm",
        "IKEA",
        "Europe"
      ]
    },
    {
      "word": "Norway",
      "hints": [
        "Oslo",
        "Fjords",
        "Europe"
      ]
    },
    {
      "word": "Denmark",
      "hints": [
        "Copenhagen",
        "Lego",
        "Europe"
      ]
    },
    {
      "word": "Finland",
      "hints": [
        "Helsinki",
        "Saunas",
        "Europe"
      ]
    },
    {
      "word": "Estonia",
      "hints": [
        "Tallinn",
        "Europe",
        "Baltic"
      ]
    },
    {
      "word": "Latvia",
      "hints": [
        "Riga",
        "Europe",
        "Baltic"
      ]
    },
    {
      "word": "Lithuania",
      "hints": [
        "Vilnius",
        "Europe",
        "Baltic"
      ]
    },
    {
      "word": "Canada",
      "hints": [
        "Ottawa",
        "Maple",
        "Moose"
      ]
    },
    {
      "word": "United States",
      "hints": [
        "Washington",
        "Eagles",
        "States"
      ]
    },
    {
      "word": "Mexico",
      "hints": [
        "City",
        "Tacos",
        "America"
      ]
    },
    {
      "word": "Guatemala",
      "hints": [
        "City",
        "Maya",
        "America"
      ]
    },
    {
      "word": "Belize",
      "hints": [
        "Belmopan",
        "America",
        "Reef"
      ]
    },
    {
      "word": "Honduras",
      "hints": [
        "Tegucigalpa",
        "America",
        "Central"
      ]
    },
    {
      "word": "El Salvador",
      "hints": [
        "San",
        "Salvador",
        "America"
      ]
    },
    {
      "word": "Nicaragua",
      "hints": [
        "Managua",
        "America",
        "Central"
      ]
    },
    {
      "word": "Costa Rica",
      "hints": [
        "San",
        "Jose",
        "Pura"
      ]
    },
    {
      "word": "Panama",
      "hints": [
        "Canal",
        "America",
        "Central"
      ]
    }
  ]
}
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/geography.json' -Value $jsonContent -Encoding UTF8

$tsContent = @'
import type { WordEntry } from '../../../types/packs'

export const INTERNET_CULTURE_PACK: WordEntry[] = [
  { "id": "internet-culture_1", "word": "Rickroll", "category": "Internet Culture", "hints": ["Astley", "Bait", "Video"] },
  { "id": "internet-culture_2", "word": "Doge", "category": "Internet Culture", "hints": ["Shiba", "Coin", "Much"] },
  { "id": "internet-culture_3", "word": "Pepe", "category": "Internet Culture", "hints": ["Frog", "Meme", "Green"] },
  { "id": "internet-culture_4", "word": "Trollface", "category": "Internet Culture", "hints": ["Problem", "Mad", "Comic"] },
  { "id": "internet-culture_5", "word": "Nyan Cat", "category": "Internet Culture", "hints": ["Pop-Tart", "Rainbow", "Space"] },
  { "id": "internet-culture_6", "word": "Harambe", "category": "Internet Culture", "hints": ["Gorilla", "Zoo", "Cincinnati"] },
  { "id": "internet-culture_7", "word": "Distracted Boyfriend", "category": "Internet Culture", "hints": ["Looking", "Meme", "Girlfriend"] },
  { "id": "internet-culture_8", "word": "Woman Yelling", "category": "Internet Culture", "hints": ["Cat", "Table", "Dinner"] },
  { "id": "internet-culture_9", "word": "This is Fine", "category": "Internet Culture", "hints": ["Dog", "Fire", "Coffee"] },
  { "id": "internet-culture_10", "word": "Drake Hotline", "category": "Internet Culture", "hints": ["Bling", "Approves", "Reject"] },
  { "id": "internet-culture_11", "word": "Two Buttons", "category": "Internet Culture", "hints": ["Sweating", "Choice", "Red"] },
  { "id": "internet-culture_12", "word": "Is This A Pigeon", "category": "Internet Culture", "hints": ["Anime", "Butterfly", "Confusion"] },
  { "id": "internet-culture_13", "word": "Arthur Fist", "category": "Internet Culture", "hints": ["Angry", "Clenched", "Cartoon"] },
  { "id": "internet-culture_14", "word": "Mocking Spongebob", "category": "Internet Culture", "hints": ["Alternating", "Caps", "Chicken"] },
  { "id": "internet-culture_15", "word": "Surprised Pikachu", "category": "Internet Culture", "hints": ["Mouth", "Open", "Shock"] },
  { "id": "internet-culture_16", "word": "Hide the Pain", "category": "Internet Culture", "hints": ["Harold", "Smile", "Stock"] },
  { "id": "internet-culture_17", "word": "Success Kid", "category": "Internet Culture", "hints": ["Sand", "Fist", "Beach"] },
  { "id": "internet-culture_18", "word": "Bad Luck Brian", "category": "Internet Culture", "hints": ["Braces", "Vest", "School"] },
  { "id": "internet-culture_19", "word": "Overly Attached", "category": "Internet Culture", "hints": ["Girlfriend", "Stare", "Creepy"] },
  { "id": "internet-culture_20", "word": "Grumpy Cat", "category": "Internet Culture", "hints": ["Tardar", "Sauce", "Frown"] },
  { "id": "internet-culture_21", "word": "Dat Boi", "category": "Internet Culture", "hints": ["Frog", "Unicycle", "Rolling"] },
  { "id": "internet-culture_22", "word": "Ugandan Knuckles", "category": "Internet Culture", "hints": ["Way", "Clicking", "Echidna"] },
  { "id": "internet-culture_23", "word": "Big Chungus", "category": "Internet Culture", "hints": ["Bugs", "Bunny", "Fat"] },
  { "id": "internet-culture_24", "word": "Stonks", "category": "Internet Culture", "hints": ["Meme", "Market", "Arrow"] },
  { "id": "internet-culture_25", "word": "Karen", "category": "Internet Culture", "hints": ["Manager", "Haircut", "Complain"] },
  { "id": "internet-culture_26", "word": "Ok Boomer", "category": "Internet Culture", "hints": ["Generation", "Dismissive", "Reply"] },
  { "id": "internet-culture_27", "word": "Simp", "category": "Internet Culture", "hints": ["Twitch", "Donation", "Desperate"] },
  { "id": "internet-culture_28", "word": "Chad", "category": "Internet Culture", "hints": ["Alpha", "Jawline", "Meme"] },
  { "id": "internet-culture_29", "word": "Virgin vs Chad", "category": "Internet Culture", "hints": ["Comparison", "Meme", "Walk"] },
  { "id": "internet-culture_30", "word": "Gigachad", "category": "Internet Culture", "hints": ["Black", "White", "Muscle"] },
  { "id": "internet-culture_31", "word": "Sigma Male", "category": "Internet Culture", "hints": ["Grindset", "Lone", "Wolf"] },
  { "id": "internet-culture_32", "word": "Cheems", "category": "Internet Culture", "hints": ["Doge", "Speech", "Impediment"] },
  { "id": "internet-culture_33", "word": "Swole Doge", "category": "Internet Culture", "hints": ["Muscle", "Compare", "Meme"] },
  { "id": "internet-culture_34", "word": "Amogus", "category": "Internet Culture", "hints": ["Sus", "Impostor", "Among"] },
  { "id": "internet-culture_35", "word": "Shitpost", "category": "Internet Culture", "hints": ["Low", "Quality", "Humor"] },
  { "id": "internet-culture_36", "word": "Copypasta", "category": "Internet Culture", "hints": ["Text", "Block", "Navy"] },
  { "id": "internet-culture_37", "word": "Yeet", "category": "Internet Culture", "hints": ["Throw", "Distance", "Force"] },
  { "id": "internet-culture_38", "word": "Skrrt", "category": "Internet Culture", "hints": ["Car", "Tires", "Drift"] },
  { "id": "internet-culture_39", "word": "Cap", "category": "Internet Culture", "hints": ["Lie", "Truth", "Hat"] },
  { "id": "internet-culture_40", "word": "Based", "category": "Internet Culture", "hints": ["Opinion", "Controversial", "Truth"] },
  { "id": "internet-culture_41", "word": "Cringe", "category": "Internet Culture", "hints": ["Uncomfortable", "Embarrassing", "Awkward"] },
  { "id": "internet-culture_42", "word": "Sus", "category": "Internet Culture", "hints": ["Suspicious", "Impostor", "Among"] },
  { "id": "internet-culture_43", "word": "Ratio", "category": "Internet Culture", "hints": ["Twitter", "Likes", "Replies"] },
  { "id": "internet-culture_44", "word": "L", "category": "Internet Culture", "hints": ["Loss", "Take", "Alphabet"] },
  { "id": "internet-culture_45", "word": "W", "category": "Internet Culture", "hints": ["Win", "Boss", "Take"] },
  { "id": "internet-culture_46", "word": "Glow Up", "category": "Internet Culture", "hints": ["Transformation", "Better", "Puberty"] },
  { "id": "internet-culture_47", "word": "Rizz", "category": "Internet Culture", "hints": ["Charisma", "Flirting", "Game"] },
  { "id": "internet-culture_48", "word": "Bussin", "category": "Internet Culture", "hints": ["Food", "Good", "Delicious"] },
  { "id": "internet-culture_49", "word": "Sheesh", "category": "Internet Culture", "hints": ["Hype", "Ice", "Veins"] },
  { "id": "internet-culture_50", "word": "Poggers", "category": "Internet Culture", "hints": ["Twitch", "Excitement", "Emote"] },
  { "id": "internet-culture_51", "word": "MonkaS", "category": "Internet Culture", "hints": ["Sweat", "Nervous", "Twitch"] },
  { "id": "internet-culture_52", "word": "Kappa", "category": "Internet Culture", "hints": ["Sarcasm", "Twitch", "Face"] },
  { "id": "internet-culture_53", "word": "KekW", "category": "Internet Culture", "hints": ["Laugh", "Twitch", "Spanish"] },
  { "id": "internet-culture_54", "word": "Pepega", "category": "Internet Culture", "hints": ["Dumb", "Twitch", "Frog"] },
  { "id": "internet-culture_55", "word": "LUL", "category": "Internet Culture", "hints": ["Laugh", "Twitch", "Bain"] },
  { "id": "internet-culture_56", "word": "F in the Chat", "category": "Internet Culture", "hints": ["Respects", "Press", "Twitch"] },
  { "id": "internet-culture_57", "word": "Vibe Check", "category": "Internet Culture", "hints": ["Energy", "Test", "Mood"] },
  { "id": "internet-culture_58", "word": "Main Character", "category": "Internet Culture", "hints": ["Energy", "Protagonist", "Syndrome"] },
  { "id": "internet-culture_59", "word": "NPC", "category": "Internet Culture", "hints": ["Non", "Player", "Brainless"] },
  { "id": "internet-culture_60", "word": "Touch Grass", "category": "Internet Culture", "hints": ["Outside", "Reality", "Offline"] },
  { "id": "internet-culture_61", "word": "Gatekeep", "category": "Internet Culture", "hints": ["Exclude", "Fans", "Girlboss"] },
  { "id": "internet-culture_62", "word": "Gaslight", "category": "Internet Culture", "hints": ["Manipulate", "Crazy", "Girlboss"] },
  { "id": "internet-culture_63", "word": "Girlboss", "category": "Internet Culture", "hints": ["Feminism", "Hustle", "Gaslight"] },
  { "id": "internet-culture_64", "word": "Slap", "category": "Internet Culture", "hints": ["Will", "Smith", "Oscars"] },
  { "id": "internet-culture_65", "word": "Area 51", "category": "Internet Culture", "hints": ["Raid", "Aliens", "Run"] },
  { "id": "internet-culture_66", "word": "Tide Pods", "category": "Internet Culture", "hints": ["Snack", "Laundry", "Challenge"] },
  { "id": "internet-culture_67", "word": "Ice Bucket", "category": "Internet Culture", "hints": ["Challenge", "ALS", "Water"] },
  { "id": "internet-culture_68", "word": "Harlem Shake", "category": "Internet Culture", "hints": ["Dance", "Drop", "Video"] },
  { "id": "internet-culture_69", "word": "Mannequin", "category": "Internet Culture", "hints": ["Challenge", "Still", "Freeze"] },
  { "id": "internet-culture_70", "word": "Planking", "category": "Internet Culture", "hints": ["Lie", "Flat", "Stiff"] },
  { "id": "internet-culture_71", "word": "Rick and Morty", "category": "Internet Culture", "hints": ["IQ", "Pickle", "Sauce"] },
  { "id": "internet-culture_72", "word": "Shrek", "category": "Internet Culture", "hints": ["Ogre", "Swamp", "Onions"] },
  { "id": "internet-culture_73", "word": "Bee Movie", "category": "Internet Culture", "hints": ["Jazz", "Script", "Seinfeld"] },
  { "id": "internet-culture_74", "word": "Shaggy", "category": "Internet Culture", "hints": ["Power", "Percent", "Scooby"] },
  { "id": "internet-culture_75", "word": "Matt", "category": "Internet Culture", "hints": ["Wii", "Sports", "Boxing"] },
  { "id": "internet-culture_76", "word": "Waluigi", "category": "Internet Culture", "hints": ["Smash", "Assist", "Wah"] },
  { "id": "internet-culture_77", "word": "Bowsette", "category": "Internet Culture", "hints": ["Crown", "Super", "Mario"] },
  { "id": "internet-culture_78", "word": "Loss", "category": "Internet Culture", "hints": ["Comic", "Lines", "Four"] },
  { "id": "internet-culture_79", "word": "Is This", "category": "Internet Culture", "hints": ["Loss", "Lines", "Comic"] },
  { "id": "internet-culture_80", "word": "E", "category": "Internet Culture", "hints": ["Mark", "iplier", "Farquaad"] },
  { "id": "internet-culture_81", "word": "B", "category": "Internet Culture", "hints": ["Emoji", "Red", "Blood"] },
  { "id": "internet-culture_82", "word": "Deep Fried", "category": "Internet Culture", "hints": ["Meme", "Filter", "Nuked"] },
  { "id": "internet-culture_83", "word": "Surreal", "category": "Internet Culture", "hints": ["Memes", "Meme", "Man"] },
  { "id": "internet-culture_84", "word": "Meme Man", "category": "Internet Culture", "hints": ["Stonks", "Head", "3D"] },
  { "id": "internet-culture_85", "word": "Orang", "category": "Internet Culture", "hints": ["Citrus", "Surreal", "Enemy"] },
  { "id": "internet-culture_86", "word": "Rage Comics", "category": "Internet Culture", "hints": ["Derp", "Troll", "Me"] },
  { "id": "internet-culture_87", "word": "Derp", "category": "Internet Culture", "hints": ["Face", "Stupid", "Eyes"] },
  { "id": "internet-culture_88", "word": "Me Gusta", "category": "Internet Culture", "hints": ["Face", "Pleasure", "Weird"] },
  { "id": "internet-culture_89", "word": "Forever Alone", "category": "Internet Culture", "hints": ["Face", "Sad", "Single"] },
  { "id": "internet-culture_90", "word": "Y U NO", "category": "Internet Culture", "hints": ["Guy", "Hands", "Face"] },
  { "id": "internet-culture_91", "word": "Philosoraptor", "category": "Internet Culture", "hints": ["Dinosaur", "Think", "Question"] },
  { "id": "internet-culture_92", "word": "Socially Awkward", "category": "Internet Culture", "hints": ["Penguin", "Red", "Blue"] },
  { "id": "internet-culture_93", "word": "Advice Animals", "category": "Internet Culture", "hints": ["Text", "Top", "Bottom"] },
  { "id": "internet-culture_94", "word": "Good Guy Greg", "category": "Internet Culture", "hints": ["Joint", "Smile", "Nice"] },
  { "id": "internet-culture_95", "word": "Scumbag Steve", "category": "Internet Culture", "hints": ["Hat", "Jacket", "Mean"] },
  { "id": "internet-culture_96", "word": "Nyan", "category": "Internet Culture", "hints": ["Cat", "Space", "Rainbow"] },
  { "id": "internet-culture_97", "word": "Keyboard Cat", "category": "Internet Culture", "hints": ["Piano", "Play", "Off"] },
  { "id": "internet-culture_98", "word": "Numa Numa", "category": "Internet Culture", "hints": ["Dance", "Fat", "Webcam"] },
  { "id": "internet-culture_99", "word": "Star Wars Kid", "category": "Internet Culture", "hints": ["Golf", "Ball", "Retrieval"] },
  { "id": "internet-culture_100", "word": "Chocolate Rain", "category": "Internet Culture", "hints": ["Tay", "Zonday", "Mic"] },
  { "id": "internet-culture_101", "word": "Leave Britney", "category": "Internet Culture", "hints": ["Alone", "Cry", "Chris"] },
  { "id": "internet-culture_102", "word": "Leeroy Jenkins", "category": "Internet Culture", "hints": ["WoW", "Charge", "Chicken"] },
  { "id": "internet-culture_103", "word": "Sneezing Panda", "category": "Internet Culture", "hints": ["Baby", "Shock", "Mom"] },
  { "id": "internet-culture_104", "word": "Charlie Bit Me", "category": "Internet Culture", "hints": ["Finger", "Baby", "Brother"] },
  { "id": "internet-culture_105", "word": "David After", "category": "Internet Culture", "hints": ["Dentist", "Real", "Life"] },
  { "id": "internet-culture_106", "word": "Double Rainbow", "category": "Internet Culture", "hints": ["Sky", "Tears", "Mean"] },
  { "id": "internet-culture_107", "word": "Bed Intruder", "category": "Internet Culture", "hints": ["Hide", "Kids", "Wife"] },
  { "id": "internet-culture_108", "word": "Ain't Nobody", "category": "Internet Culture", "hints": ["Got", "Time", "That"] },
  { "id": "internet-culture_109", "word": "Sweet Brown", "category": "Internet Culture", "hints": ["Cold", "Bronchitis", "Pop"] },
  { "id": "internet-culture_110", "word": "Alex from Target", "category": "Internet Culture", "hints": ["Bag", "Boy", "Viral"] },
  { "id": "internet-culture_111", "word": "Damn Daniel", "category": "Internet Culture", "hints": ["White", "Vans", "Shoes"] },
  { "id": "internet-culture_112", "word": "What Are Those", "category": "Internet Culture", "hints": ["Shoes", "Point", "Question"] },
  { "id": "internet-culture_113", "word": "Do It For The Vine", "category": "Internet Culture", "hints": ["Video", "App", "Loop"] },
  { "id": "internet-culture_114", "word": "Cash Me Outside", "category": "Internet Culture", "hints": ["Bow", "Dah", "Dr. Phil"] },
  { "id": "internet-culture_115", "word": "Walmart Yodeling", "category": "Internet Culture", "hints": ["Kid", "Aisle", "Country"] },
  { "id": "internet-culture_116", "word": "Backpack Kid", "category": "Internet Culture", "hints": ["Floss", "Dance", "Katy"] },
  { "id": "internet-culture_117", "word": "Moth", "category": "Internet Culture", "hints": ["Lamp", "Light", "Insects"] },
  { "id": "internet-culture_118", "word": "Cats Can Have", "category": "Internet Culture", "hints": ["Little", "Salami", "Treat"] },
  { "id": "internet-culture_119", "word": "Bingus", "category": "Internet Culture", "hints": ["Hairless", "Cat", "Smooth"] },
  { "id": "internet-culture_120", "word": "Floppa", "category": "Internet Culture", "hints": ["Caracal", "Ears", "Cat"] }
] as const
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/packs/internetCulture.ts' -Value $tsContent -Encoding UTF8

$jsonContent = @'
{
  "id": "internet-culture",
  "name": "Internet Culture",
  "emoji": "\ud83c\udf10",
  "description": "Memes, slang, and viral trends.",
  "words": [
    {
      "word": "Rickroll",
      "hints": [
        "Astley",
        "Bait",
        "Video"
      ]
    },
    {
      "word": "Doge",
      "hints": [
        "Shiba",
        "Coin",
        "Much"
      ]
    },
    {
      "word": "Pepe",
      "hints": [
        "Frog",
        "Meme",
        "Green"
      ]
    },
    {
      "word": "Trollface",
      "hints": [
        "Problem",
        "Mad",
        "Comic"
      ]
    },
    {
      "word": "Nyan Cat",
      "hints": [
        "Pop-Tart",
        "Rainbow",
        "Space"
      ]
    },
    {
      "word": "Harambe",
      "hints": [
        "Gorilla",
        "Zoo",
        "Cincinnati"
      ]
    },
    {
      "word": "Distracted Boyfriend",
      "hints": [
        "Looking",
        "Meme",
        "Girlfriend"
      ]
    },
    {
      "word": "Woman Yelling",
      "hints": [
        "Cat",
        "Table",
        "Dinner"
      ]
    },
    {
      "word": "This is Fine",
      "hints": [
        "Dog",
        "Fire",
        "Coffee"
      ]
    },
    {
      "word": "Drake Hotline",
      "hints": [
        "Bling",
        "Approves",
        "Reject"
      ]
    },
    {
      "word": "Two Buttons",
      "hints": [
        "Sweating",
        "Choice",
        "Red"
      ]
    },
    {
      "word": "Is This A Pigeon",
      "hints": [
        "Anime",
        "Butterfly",
        "Confusion"
      ]
    },
    {
      "word": "Arthur Fist",
      "hints": [
        "Angry",
        "Clenched",
        "Cartoon"
      ]
    },
    {
      "word": "Mocking Spongebob",
      "hints": [
        "Alternating",
        "Caps",
        "Chicken"
      ]
    },
    {
      "word": "Surprised Pikachu",
      "hints": [
        "Mouth",
        "Open",
        "Shock"
      ]
    },
    {
      "word": "Hide the Pain",
      "hints": [
        "Harold",
        "Smile",
        "Stock"
      ]
    },
    {
      "word": "Success Kid",
      "hints": [
        "Sand",
        "Fist",
        "Beach"
      ]
    },
    {
      "word": "Bad Luck Brian",
      "hints": [
        "Braces",
        "Vest",
        "School"
      ]
    },
    {
      "word": "Overly Attached",
      "hints": [
        "Girlfriend",
        "Stare",
        "Creepy"
      ]
    },
    {
      "word": "Grumpy Cat",
      "hints": [
        "Tardar",
        "Sauce",
        "Frown"
      ]
    },
    {
      "word": "Dat Boi",
      "hints": [
        "Frog",
        "Unicycle",
        "Rolling"
      ]
    },
    {
      "word": "Ugandan Knuckles",
      "hints": [
        "Way",
        "Clicking",
        "Echidna"
      ]
    },
    {
      "word": "Big Chungus",
      "hints": [
        "Bugs",
        "Bunny",
        "Fat"
      ]
    },
    {
      "word": "Stonks",
      "hints": [
        "Meme",
        "Market",
        "Arrow"
      ]
    },
    {
      "word": "Karen",
      "hints": [
        "Manager",
        "Haircut",
        "Complain"
      ]
    },
    {
      "word": "Ok Boomer",
      "hints": [
        "Generation",
        "Dismissive",
        "Reply"
      ]
    },
    {
      "word": "Simp",
      "hints": [
        "Twitch",
        "Donation",
        "Desperate"
      ]
    },
    {
      "word": "Chad",
      "hints": [
        "Alpha",
        "Jawline",
        "Meme"
      ]
    },
    {
      "word": "Virgin vs Chad",
      "hints": [
        "Comparison",
        "Meme",
        "Walk"
      ]
    },
    {
      "word": "Gigachad",
      "hints": [
        "Black",
        "White",
        "Muscle"
      ]
    },
    {
      "word": "Sigma Male",
      "hints": [
        "Grindset",
        "Lone",
        "Wolf"
      ]
    },
    {
      "word": "Cheems",
      "hints": [
        "Doge",
        "Speech",
        "Impediment"
      ]
    },
    {
      "word": "Swole Doge",
      "hints": [
        "Muscle",
        "Compare",
        "Meme"
      ]
    },
    {
      "word": "Amogus",
      "hints": [
        "Sus",
        "Impostor",
        "Among"
      ]
    },
    {
      "word": "Shitpost",
      "hints": [
        "Low",
        "Quality",
        "Humor"
      ]
    },
    {
      "word": "Copypasta",
      "hints": [
        "Text",
        "Block",
        "Navy"
      ]
    },
    {
      "word": "Yeet",
      "hints": [
        "Throw",
        "Distance",
        "Force"
      ]
    },
    {
      "word": "Skrrt",
      "hints": [
        "Car",
        "Tires",
        "Drift"
      ]
    },
    {
      "word": "Cap",
      "hints": [
        "Lie",
        "Truth",
        "Hat"
      ]
    },
    {
      "word": "Based",
      "hints": [
        "Opinion",
        "Controversial",
        "Truth"
      ]
    },
    {
      "word": "Cringe",
      "hints": [
        "Uncomfortable",
        "Embarrassing",
        "Awkward"
      ]
    },
    {
      "word": "Sus",
      "hints": [
        "Suspicious",
        "Impostor",
        "Among"
      ]
    },
    {
      "word": "Ratio",
      "hints": [
        "Twitter",
        "Likes",
        "Replies"
      ]
    },
    {
      "word": "L",
      "hints": [
        "Loss",
        "Take",
        "Alphabet"
      ]
    },
    {
      "word": "W",
      "hints": [
        "Win",
        "Boss",
        "Take"
      ]
    },
    {
      "word": "Glow Up",
      "hints": [
        "Transformation",
        "Better",
        "Puberty"
      ]
    },
    {
      "word": "Rizz",
      "hints": [
        "Charisma",
        "Flirting",
        "Game"
      ]
    },
    {
      "word": "Bussin",
      "hints": [
        "Food",
        "Good",
        "Delicious"
      ]
    },
    {
      "word": "Sheesh",
      "hints": [
        "Hype",
        "Ice",
        "Veins"
      ]
    },
    {
      "word": "Poggers",
      "hints": [
        "Twitch",
        "Excitement",
        "Emote"
      ]
    },
    {
      "word": "MonkaS",
      "hints": [
        "Sweat",
        "Nervous",
        "Twitch"
      ]
    },
    {
      "word": "Kappa",
      "hints": [
        "Sarcasm",
        "Twitch",
        "Face"
      ]
    },
    {
      "word": "KekW",
      "hints": [
        "Laugh",
        "Twitch",
        "Spanish"
      ]
    },
    {
      "word": "Pepega",
      "hints": [
        "Dumb",
        "Twitch",
        "Frog"
      ]
    },
    {
      "word": "LUL",
      "hints": [
        "Laugh",
        "Twitch",
        "Bain"
      ]
    },
    {
      "word": "F in the Chat",
      "hints": [
        "Respects",
        "Press",
        "Twitch"
      ]
    },
    {
      "word": "Vibe Check",
      "hints": [
        "Energy",
        "Test",
        "Mood"
      ]
    },
    {
      "word": "Main Character",
      "hints": [
        "Energy",
        "Protagonist",
        "Syndrome"
      ]
    },
    {
      "word": "NPC",
      "hints": [
        "Non",
        "Player",
        "Brainless"
      ]
    },
    {
      "word": "Touch Grass",
      "hints": [
        "Outside",
        "Reality",
        "Offline"
      ]
    },
    {
      "word": "Gatekeep",
      "hints": [
        "Exclude",
        "Fans",
        "Girlboss"
      ]
    },
    {
      "word": "Gaslight",
      "hints": [
        "Manipulate",
        "Crazy",
        "Girlboss"
      ]
    },
    {
      "word": "Girlboss",
      "hints": [
        "Feminism",
        "Hustle",
        "Gaslight"
      ]
    },
    {
      "word": "Slap",
      "hints": [
        "Will",
        "Smith",
        "Oscars"
      ]
    },
    {
      "word": "Area 51",
      "hints": [
        "Raid",
        "Aliens",
        "Run"
      ]
    },
    {
      "word": "Tide Pods",
      "hints": [
        "Snack",
        "Laundry",
        "Challenge"
      ]
    },
    {
      "word": "Ice Bucket",
      "hints": [
        "Challenge",
        "ALS",
        "Water"
      ]
    },
    {
      "word": "Harlem Shake",
      "hints": [
        "Dance",
        "Drop",
        "Video"
      ]
    },
    {
      "word": "Mannequin",
      "hints": [
        "Challenge",
        "Still",
        "Freeze"
      ]
    },
    {
      "word": "Planking",
      "hints": [
        "Lie",
        "Flat",
        "Stiff"
      ]
    },
    {
      "word": "Rick and Morty",
      "hints": [
        "IQ",
        "Pickle",
        "Sauce"
      ]
    },
    {
      "word": "Shrek",
      "hints": [
        "Ogre",
        "Swamp",
        "Onions"
      ]
    },
    {
      "word": "Bee Movie",
      "hints": [
        "Jazz",
        "Script",
        "Seinfeld"
      ]
    },
    {
      "word": "Shaggy",
      "hints": [
        "Power",
        "Percent",
        "Scooby"
      ]
    },
    {
      "word": "Matt",
      "hints": [
        "Wii",
        "Sports",
        "Boxing"
      ]
    },
    {
      "word": "Waluigi",
      "hints": [
        "Smash",
        "Assist",
        "Wah"
      ]
    },
    {
      "word": "Bowsette",
      "hints": [
        "Crown",
        "Super",
        "Mario"
      ]
    },
    {
      "word": "Loss",
      "hints": [
        "Comic",
        "Lines",
        "Four"
      ]
    },
    {
      "word": "Is This",
      "hints": [
        "Loss",
        "Lines",
        "Comic"
      ]
    },
    {
      "word": "E",
      "hints": [
        "Mark",
        "iplier",
        "Farquaad"
      ]
    },
    {
      "word": "B",
      "hints": [
        "Emoji",
        "Red",
        "Blood"
      ]
    },
    {
      "word": "Deep Fried",
      "hints": [
        "Meme",
        "Filter",
        "Nuked"
      ]
    },
    {
      "word": "Surreal",
      "hints": [
        "Memes",
        "Meme",
        "Man"
      ]
    },
    {
      "word": "Meme Man",
      "hints": [
        "Stonks",
        "Head",
        "3D"
      ]
    },
    {
      "word": "Orang",
      "hints": [
        "Citrus",
        "Surreal",
        "Enemy"
      ]
    },
    {
      "word": "Rage Comics",
      "hints": [
        "Derp",
        "Troll",
        "Me"
      ]
    },
    {
      "word": "Derp",
      "hints": [
        "Face",
        "Stupid",
        "Eyes"
      ]
    },
    {
      "word": "Me Gusta",
      "hints": [
        "Face",
        "Pleasure",
        "Weird"
      ]
    },
    {
      "word": "Forever Alone",
      "hints": [
        "Face",
        "Sad",
        "Single"
      ]
    },
    {
      "word": "Y U NO",
      "hints": [
        "Guy",
        "Hands",
        "Face"
      ]
    },
    {
      "word": "Philosoraptor",
      "hints": [
        "Dinosaur",
        "Think",
        "Question"
      ]
    },
    {
      "word": "Socially Awkward",
      "hints": [
        "Penguin",
        "Red",
        "Blue"
      ]
    },
    {
      "word": "Advice Animals",
      "hints": [
        "Text",
        "Top",
        "Bottom"
      ]
    },
    {
      "word": "Good Guy Greg",
      "hints": [
        "Joint",
        "Smile",
        "Nice"
      ]
    },
    {
      "word": "Scumbag Steve",
      "hints": [
        "Hat",
        "Jacket",
        "Mean"
      ]
    },
    {
      "word": "Nyan",
      "hints": [
        "Cat",
        "Space",
        "Rainbow"
      ]
    },
    {
      "word": "Keyboard Cat",
      "hints": [
        "Piano",
        "Play",
        "Off"
      ]
    },
    {
      "word": "Numa Numa",
      "hints": [
        "Dance",
        "Fat",
        "Webcam"
      ]
    },
    {
      "word": "Star Wars Kid",
      "hints": [
        "Golf",
        "Ball",
        "Retrieval"
      ]
    },
    {
      "word": "Chocolate Rain",
      "hints": [
        "Tay",
        "Zonday",
        "Mic"
      ]
    },
    {
      "word": "Leave Britney",
      "hints": [
        "Alone",
        "Cry",
        "Chris"
      ]
    },
    {
      "word": "Leeroy Jenkins",
      "hints": [
        "WoW",
        "Charge",
        "Chicken"
      ]
    },
    {
      "word": "Sneezing Panda",
      "hints": [
        "Baby",
        "Shock",
        "Mom"
      ]
    },
    {
      "word": "Charlie Bit Me",
      "hints": [
        "Finger",
        "Baby",
        "Brother"
      ]
    },
    {
      "word": "David After",
      "hints": [
        "Dentist",
        "Real",
        "Life"
      ]
    },
    {
      "word": "Double Rainbow",
      "hints": [
        "Sky",
        "Tears",
        "Mean"
      ]
    },
    {
      "word": "Bed Intruder",
      "hints": [
        "Hide",
        "Kids",
        "Wife"
      ]
    },
    {
      "word": "Ain't Nobody",
      "hints": [
        "Got",
        "Time",
        "That"
      ]
    },
    {
      "word": "Sweet Brown",
      "hints": [
        "Cold",
        "Bronchitis",
        "Pop"
      ]
    },
    {
      "word": "Alex from Target",
      "hints": [
        "Bag",
        "Boy",
        "Viral"
      ]
    },
    {
      "word": "Damn Daniel",
      "hints": [
        "White",
        "Vans",
        "Shoes"
      ]
    },
    {
      "word": "What Are Those",
      "hints": [
        "Shoes",
        "Point",
        "Question"
      ]
    },
    {
      "word": "Do It For The Vine",
      "hints": [
        "Video",
        "App",
        "Loop"
      ]
    },
    {
      "word": "Cash Me Outside",
      "hints": [
        "Bow",
        "Dah",
        "Dr. Phil"
      ]
    },
    {
      "word": "Walmart Yodeling",
      "hints": [
        "Kid",
        "Aisle",
        "Country"
      ]
    },
    {
      "word": "Backpack Kid",
      "hints": [
        "Floss",
        "Dance",
        "Katy"
      ]
    },
    {
      "word": "Moth",
      "hints": [
        "Lamp",
        "Light",
        "Insects"
      ]
    },
    {
      "word": "Cats Can Have",
      "hints": [
        "Little",
        "Salami",
        "Treat"
      ]
    },
    {
      "word": "Bingus",
      "hints": [
        "Hairless",
        "Cat",
        "Smooth"
      ]
    },
    {
      "word": "Floppa",
      "hints": [
        "Caracal",
        "Ears",
        "Cat"
      ]
    }
  ]
}
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/internet-culture.json' -Value $jsonContent -Encoding UTF8

$tsContent = @'
import type { WordEntry } from '../../../types/packs'

export const MOVIES_PACK: WordEntry[] = [
  { "id": "movies_1", "word": "The Godfather", "category": "Movies", "hints": ["Mafia", "Corleone", "Offer"] },
  { "id": "movies_2", "word": "Star Wars", "category": "Movies", "hints": ["Jedi", "Force", "Vader"] },
  { "id": "movies_3", "word": "Jurassic Park", "category": "Movies", "hints": ["Dinosaurs", "Amber", "Rex"] },
  { "id": "movies_4", "word": "Titanic", "category": "Movies", "hints": ["Ship", "Iceberg", "Jack"] },
  { "id": "movies_5", "word": "The Matrix", "category": "Movies", "hints": ["Neo", "Pills", "Simulation"] },
  { "id": "movies_6", "word": "Inception", "category": "Movies", "hints": ["Dreams", "Top", "Spinning"] },
  { "id": "movies_7", "word": "Avatar", "category": "Movies", "hints": ["Blue", "Pandora", "Navi"] },
  { "id": "movies_8", "word": "Avengers", "category": "Movies", "hints": ["Assemble", "Marvel", "Thanos"] },
  { "id": "movies_9", "word": "Harry Potter", "category": "Movies", "hints": ["Wizard", "Hogwarts", "Scar"] },
  { "id": "movies_10", "word": "Lord of the Rings", "category": "Movies", "hints": ["Hobbits", "Ring", "Mordor"] },
  { "id": "movies_11", "word": "Pulp Fiction", "category": "Movies", "hints": ["Tarantino", "Briefcase", "Dance"] },
  { "id": "movies_12", "word": "Forrest Gump", "category": "Movies", "hints": ["Chocolates", "Run", "Jenny"] },
  { "id": "movies_13", "word": "Fight Club", "category": "Movies", "hints": ["Rules", "Soap", "Tyler"] },
  { "id": "movies_14", "word": "The Shining", "category": "Movies", "hints": ["Axe", "Twins", "Hotel"] },
  { "id": "movies_15", "word": "Jaws", "category": "Movies", "hints": ["Shark", "Boat", "Teeth"] },
  { "id": "movies_16", "word": "E.T.", "category": "Movies", "hints": ["Alien", "Bicycle", "Phone"] },
  { "id": "movies_17", "word": "Back to the Future", "category": "Movies", "hints": ["DeLorean", "Marty", "Time"] },
  { "id": "movies_18", "word": "Indiana Jones", "category": "Movies", "hints": ["Whip", "Fedora", "Boulder"] },
  { "id": "movies_19", "word": "Terminator", "category": "Movies", "hints": ["Robot", "Arnold", "Back"] },
  { "id": "movies_20", "word": "Die Hard", "category": "Movies", "hints": ["Nakatomi", "Vent", "Christmas"] },
  { "id": "movies_21", "word": "Rocky", "category": "Movies", "hints": ["Boxing", "Steps", "Adrian"] },
  { "id": "movies_22", "word": "Alien", "category": "Movies", "hints": ["Chestburster", "Space", "Ripley"] },
  { "id": "movies_23", "word": "Ghostbusters", "category": "Movies", "hints": ["Proton", "Slime", "Marshmallow"] },
  { "id": "movies_24", "word": "Blade Runner", "category": "Movies", "hints": ["Replicants", "Tears", "Rain"] },
  { "id": "movies_25", "word": "Mad Max", "category": "Movies", "hints": ["Wasteland", "Cars", "Fury"] },
  { "id": "movies_26", "word": "Gladiator", "category": "Movies", "hints": ["Arena", "Maximus", "Rome"] },
  { "id": "movies_27", "word": "Braveheart", "category": "Movies", "hints": ["Freedom", "Kilt", "Scotland"] },
  { "id": "movies_28", "word": "The Lion King", "category": "Movies", "hints": ["Simba", "Pride", "Mufasa"] },
  { "id": "movies_29", "word": "Toy Story", "category": "Movies", "hints": ["Woody", "Buzz", "Andy"] },
  { "id": "movies_30", "word": "Finding Nemo", "category": "Movies", "hints": ["Fish", "Ocean", "Dory"] },
  { "id": "movies_31", "word": "Shrek", "category": "Movies", "hints": ["Ogre", "Donkey", "Swamp"] },
  { "id": "movies_32", "word": "Frozen", "category": "Movies", "hints": ["Ice", "Let", "Snowman"] },
  { "id": "movies_33", "word": "Moana", "category": "Movies", "hints": ["Ocean", "Demigod", "Wayfinder"] },
  { "id": "movies_34", "word": "Spider-Man", "category": "Movies", "hints": ["Web", "Bite", "Uncle"] },
  { "id": "movies_35", "word": "Batman", "category": "Movies", "hints": ["Gotham", "Joker", "Cape"] },
  { "id": "movies_36", "word": "Superman", "category": "Movies", "hints": ["Krypton", "Cape", "Metropolis"] },
  { "id": "movies_37", "word": "Wonder Woman", "category": "Movies", "hints": ["Lasso", "Amazon", "Shield"] },
  { "id": "movies_38", "word": "X-Men", "category": "Movies", "hints": ["Mutants", "Wolverine", "School"] },
  { "id": "movies_39", "word": "Joker", "category": "Movies", "hints": ["Clown", "Stairs", "Society"] },
  { "id": "movies_40", "word": "Deadpool", "category": "Movies", "hints": ["Fourth", "Wall", "Chimichangas"] },
  { "id": "movies_41", "word": "Black Panther", "category": "Movies", "hints": ["Wakanda", "Vibranium", "King"] },
  { "id": "movies_42", "word": "Iron Man", "category": "Movies", "hints": ["Suit", "Stark", "Arc"] },
  { "id": "movies_43", "word": "Captain America", "category": "Movies", "hints": ["Shield", "Ice", "Steve"] },
  { "id": "movies_44", "word": "Thor", "category": "Movies", "hints": ["Hammer", "Lightning", "Asgard"] },
  { "id": "movies_45", "word": "Guardians", "category": "Movies", "hints": ["Galaxy", "Tree", "Raccoon"] },
  { "id": "movies_46", "word": "James Bond", "category": "Movies", "hints": ["Spy", "Martini", "007"] },
  { "id": "movies_47", "word": "Mission Impossible", "category": "Movies", "hints": ["Cruise", "Stunts", "Masks"] },
  { "id": "movies_48", "word": "Fast and Furious", "category": "Movies", "hints": ["Family", "Cars", "Racing"] },
  { "id": "movies_49", "word": "Transformers", "category": "Movies", "hints": ["Autobots", "Disguise", "Robots"] },
  { "id": "movies_50", "word": "Pirates", "category": "Movies", "hints": ["Caribbean", "Sparrow", "Ship"] },
  { "id": "movies_51", "word": "The Hunger Games", "category": "Movies", "hints": ["Mockingjay", "Katniss", "District"] },
  { "id": "movies_52", "word": "Twilight", "category": "Movies", "hints": ["Vampires", "Sparkle", "Bella"] },
  { "id": "movies_53", "word": "The Hobbit", "category": "Movies", "hints": ["Bilbo", "Dragon", "Dwarves"] },
  { "id": "movies_54", "word": "Dune", "category": "Movies", "hints": ["Spice", "Sandworm", "Arrakis"] },
  { "id": "movies_55", "word": "Interstellar", "category": "Movies", "hints": ["Black", "Hole", "Time"] },
  { "id": "movies_56", "word": "Gravity", "category": "Movies", "hints": ["Space", "Debris", "Tether"] },
  { "id": "movies_57", "word": "The Martian", "category": "Movies", "hints": ["Potatoes", "Mars", "Duct"] },
  { "id": "movies_58", "word": "Arrival", "category": "Movies", "hints": ["Language", "Aliens", "Circular"] },
  { "id": "movies_59", "word": "Blade Runner 2049", "category": "Movies", "hints": ["Hologram", "Gosling", "Snow"] },
  { "id": "movies_60", "word": "Mad Max Fury Road", "category": "Movies", "hints": ["Valhalla", "Guitar", "Desert"] },
  { "id": "movies_61", "word": "Parasite", "category": "Movies", "hints": ["Basement", "Rich", "Poor"] },
  { "id": "movies_62", "word": "Everything Everywhere", "category": "Movies", "hints": ["Bagel", "Multiverse", "Fingers"] },
  { "id": "movies_63", "word": "La La Land", "category": "Movies", "hints": ["Musical", "Jazz", "Stars"] },
  { "id": "movies_64", "word": "Whiplash", "category": "Movies", "hints": ["Drums", "Tempo", "Rush"] },
  { "id": "movies_65", "word": "Birdman", "category": "Movies", "hints": ["Theater", "Take", "Wings"] },
  { "id": "movies_66", "word": "The Revenant", "category": "Movies", "hints": ["Bear", "Snow", "Leo"] },
  { "id": "movies_67", "word": "Jojo Rabbit", "category": "Movies", "hints": ["Hitler", "Shoes", "Camp"] },
  { "id": "movies_68", "word": "Get Out", "category": "Movies", "hints": ["Sunken", "Place", "Tea"] },
  { "id": "movies_69", "word": "Us", "category": "Movies", "hints": ["Tethered", "Scissors", "Red"] },
  { "id": "movies_70", "word": "Nope", "category": "Movies", "hints": ["Cloud", "UFO", "Horses"] },
  { "id": "movies_71", "word": "Hereditary", "category": "Movies", "hints": ["Head", "Treehouse", "Click"] },
  { "id": "movies_72", "word": "Midsommar", "category": "Movies", "hints": ["Flower", "Crown", "Cult"] },
  { "id": "movies_73", "word": "The Witch", "category": "Movies", "hints": ["Goat", "Butter", "Puritan"] },
  { "id": "movies_74", "word": "The Lighthouse", "category": "Movies", "hints": ["Gull", "Beans", "Mermaid"] },
  { "id": "movies_75", "word": "Uncut Gems", "category": "Movies", "hints": ["Opal", "Bet", "Adam"] },
  { "id": "movies_76", "word": "Goodfellas", "category": "Movies", "hints": ["Mob", "Funny", "Pasta"] },
  { "id": "movies_77", "word": "Casino", "category": "Movies", "hints": ["Vegas", "Mob", "Desert"] },
  { "id": "movies_78", "word": "The Wolf of Wall Street", "category": "Movies", "hints": ["Stocks", "Quaaludes", "Chest"] },
  { "id": "movies_79", "word": "Catch Me If You Can", "category": "Movies", "hints": ["Pilot", "Checks", "Chase"] },
  { "id": "movies_80", "word": "Schindlers List", "category": "Movies", "hints": ["Red", "Coat", "Factory"] },
  { "id": "movies_81", "word": "Saving Private Ryan", "category": "Movies", "hints": ["Beach", "Brother", "Normandy"] },
  { "id": "movies_82", "word": "Amadeus", "category": "Movies", "hints": ["Mozart", "Salieri", "Laugh"] },
  { "id": "movies_83", "word": "A Clockwork Orange", "category": "Movies", "hints": ["Milk", "Eyes", "Beethoven"] },
  { "id": "movies_84", "word": "2001 A Space Odyssey", "category": "Movies", "hints": ["Monolith", "HAL", "Bone"] },
  { "id": "movies_85", "word": "The Truman Show", "category": "Movies", "hints": ["Dome", "TV", "Morning"] },
  { "id": "movies_86", "word": "Eternal Sunshine", "category": "Movies", "hints": ["Memory", "Erase", "Ice"] },
  { "id": "movies_87", "word": "Her", "category": "Movies", "hints": ["AI", "OS", "Voice"] },
  { "id": "movies_88", "word": "Ex Machina", "category": "Movies", "hints": ["Robot", "Turing", "Dance"] },
  { "id": "movies_89", "word": "The Social Network", "category": "Movies", "hints": ["Facebook", "Harvard", "Code"] },
  { "id": "movies_90", "word": "Zodiac", "category": "Movies", "hints": ["Cipher", "San", "Francisco"] },
  { "id": "movies_91", "word": "Se7en", "category": "Movies", "hints": ["Box", "Sins", "Rain"] },
  { "id": "movies_92", "word": "Silence of the Lambs", "category": "Movies", "hints": ["Lecter", "Moth", "Fava"] },
  { "id": "movies_93", "word": "Psycho", "category": "Movies", "hints": ["Shower", "Motel", "Mother"] },
  { "id": "movies_94", "word": "Vertigo", "category": "Movies", "hints": ["Tower", "Heights", "Swirl"] },
  { "id": "movies_95", "word": "Rear Window", "category": "Movies", "hints": ["Cast", "Binoculars", "Neighbor"] },
  { "id": "movies_96", "word": "North by Northwest", "category": "Movies", "hints": ["Crop", "Duster", "Rushmore"] },
  { "id": "movies_97", "word": "Casablanca", "category": "Movies", "hints": ["Piano", "Paris", "Airport"] },
  { "id": "movies_98", "word": "Citizen Kane", "category": "Movies", "hints": ["Rosebud", "Sled", "Newspaper"] },
  { "id": "movies_99", "word": "Gone with the Wind", "category": "Movies", "hints": ["Tara", "Frankly", "Curtain"] },
  { "id": "movies_100", "word": "The Wizard of Oz", "category": "Movies", "hints": ["Tornado", "Shoes", "Yellow"] },
  { "id": "movies_101", "word": "Singin in the Rain", "category": "Movies", "hints": ["Umbrella", "Puddle", "Musical"] },
  { "id": "movies_102", "word": "Some Like It Hot", "category": "Movies", "hints": ["Drag", "Band", "Train"] },
  { "id": "movies_103", "word": "12 Angry Men", "category": "Movies", "hints": ["Jury", "Room", "Guilty"] },
  { "id": "movies_104", "word": "To Kill a Mockingbird", "category": "Movies", "hints": ["Atticus", "Scout", "Trial"] },
  { "id": "movies_105", "word": "The Good, the Bad", "category": "Movies", "hints": ["Ugly", "Standoff", "Gold"] },
  { "id": "movies_106", "word": "Once Upon a Time", "category": "Movies", "hints": ["West", "Harmonica", "Revenge"] },
  { "id": "movies_107", "word": "Taxi Driver", "category": "Movies", "hints": ["Mohawk", "Mirror", "Cab"] },
  { "id": "movies_108", "word": "Raging Bull", "category": "Movies", "hints": ["Boxer", "Weight", "Brother"] },
  { "id": "movies_109", "word": "Apocalypse Now", "category": "Movies", "hints": ["Napalm", "Smell", "River"] },
  { "id": "movies_110", "word": "The Deer Hunter", "category": "Movies", "hints": ["Roulette", "Vietnam", "Wedding"] },
  { "id": "movies_111", "word": "Platoon", "category": "Movies", "hints": ["Knees", "Arms", "Jungle"] },
  { "id": "movies_112", "word": "Full Metal Jacket", "category": "Movies", "hints": ["Drill", "Instructor", "Helmet"] },
  { "id": "movies_113", "word": "The Big Lebowski", "category": "Movies", "hints": ["Rug", "Bowling", "Dude"] },
  { "id": "movies_114", "word": "Fargo", "category": "Movies", "hints": ["Woodchipper", "Snow", "Minnesota"] },
  { "id": "movies_115", "word": "No Country for Old Men", "category": "Movies", "hints": ["Coin", "Toss", "Air"] },
  { "id": "movies_116", "word": "There Will Be Blood", "category": "Movies", "hints": ["Milkshake", "Oil", "Bowling"] },
  { "id": "movies_117", "word": "Boogie Nights", "category": "Movies", "hints": ["Porn", "Roller", "70s"] },
  { "id": "movies_118", "word": "Magnolia", "category": "Movies", "hints": ["Frogs", "Rain", "Interconnected"] },
  { "id": "movies_119", "word": "Punch-Drunk Love", "category": "Movies", "hints": ["Pudding", "Harmonium", "Suit"] }
] as const
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/packs/movies.ts' -Value $tsContent -Encoding UTF8

$jsonContent = @'
{
  "id": "movies",
  "name": "Movies",
  "emoji": "\ud83c\udfac",
  "description": "Blockbusters, classics, and cinema.",
  "words": [
    {
      "word": "The Godfather",
      "hints": [
        "Mafia",
        "Corleone",
        "Offer"
      ]
    },
    {
      "word": "Star Wars",
      "hints": [
        "Jedi",
        "Force",
        "Vader"
      ]
    },
    {
      "word": "Jurassic Park",
      "hints": [
        "Dinosaurs",
        "Amber",
        "Rex"
      ]
    },
    {
      "word": "Titanic",
      "hints": [
        "Ship",
        "Iceberg",
        "Jack"
      ]
    },
    {
      "word": "The Matrix",
      "hints": [
        "Neo",
        "Pills",
        "Simulation"
      ]
    },
    {
      "word": "Inception",
      "hints": [
        "Dreams",
        "Top",
        "Spinning"
      ]
    },
    {
      "word": "Avatar",
      "hints": [
        "Blue",
        "Pandora",
        "Navi"
      ]
    },
    {
      "word": "Avengers",
      "hints": [
        "Assemble",
        "Marvel",
        "Thanos"
      ]
    },
    {
      "word": "Harry Potter",
      "hints": [
        "Wizard",
        "Hogwarts",
        "Scar"
      ]
    },
    {
      "word": "Lord of the Rings",
      "hints": [
        "Hobbits",
        "Ring",
        "Mordor"
      ]
    },
    {
      "word": "Pulp Fiction",
      "hints": [
        "Tarantino",
        "Briefcase",
        "Dance"
      ]
    },
    {
      "word": "Forrest Gump",
      "hints": [
        "Chocolates",
        "Run",
        "Jenny"
      ]
    },
    {
      "word": "Fight Club",
      "hints": [
        "Rules",
        "Soap",
        "Tyler"
      ]
    },
    {
      "word": "The Shining",
      "hints": [
        "Axe",
        "Twins",
        "Hotel"
      ]
    },
    {
      "word": "Jaws",
      "hints": [
        "Shark",
        "Boat",
        "Teeth"
      ]
    },
    {
      "word": "E.T.",
      "hints": [
        "Alien",
        "Bicycle",
        "Phone"
      ]
    },
    {
      "word": "Back to the Future",
      "hints": [
        "DeLorean",
        "Marty",
        "Time"
      ]
    },
    {
      "word": "Indiana Jones",
      "hints": [
        "Whip",
        "Fedora",
        "Boulder"
      ]
    },
    {
      "word": "Terminator",
      "hints": [
        "Robot",
        "Arnold",
        "Back"
      ]
    },
    {
      "word": "Die Hard",
      "hints": [
        "Nakatomi",
        "Vent",
        "Christmas"
      ]
    },
    {
      "word": "Rocky",
      "hints": [
        "Boxing",
        "Steps",
        "Adrian"
      ]
    },
    {
      "word": "Alien",
      "hints": [
        "Chestburster",
        "Space",
        "Ripley"
      ]
    },
    {
      "word": "Ghostbusters",
      "hints": [
        "Proton",
        "Slime",
        "Marshmallow"
      ]
    },
    {
      "word": "Blade Runner",
      "hints": [
        "Replicants",
        "Tears",
        "Rain"
      ]
    },
    {
      "word": "Mad Max",
      "hints": [
        "Wasteland",
        "Cars",
        "Fury"
      ]
    },
    {
      "word": "Gladiator",
      "hints": [
        "Arena",
        "Maximus",
        "Rome"
      ]
    },
    {
      "word": "Braveheart",
      "hints": [
        "Freedom",
        "Kilt",
        "Scotland"
      ]
    },
    {
      "word": "The Lion King",
      "hints": [
        "Simba",
        "Pride",
        "Mufasa"
      ]
    },
    {
      "word": "Toy Story",
      "hints": [
        "Woody",
        "Buzz",
        "Andy"
      ]
    },
    {
      "word": "Finding Nemo",
      "hints": [
        "Fish",
        "Ocean",
        "Dory"
      ]
    },
    {
      "word": "Shrek",
      "hints": [
        "Ogre",
        "Donkey",
        "Swamp"
      ]
    },
    {
      "word": "Frozen",
      "hints": [
        "Ice",
        "Let",
        "Snowman"
      ]
    },
    {
      "word": "Moana",
      "hints": [
        "Ocean",
        "Demigod",
        "Wayfinder"
      ]
    },
    {
      "word": "Spider-Man",
      "hints": [
        "Web",
        "Bite",
        "Uncle"
      ]
    },
    {
      "word": "Batman",
      "hints": [
        "Gotham",
        "Joker",
        "Cape"
      ]
    },
    {
      "word": "Superman",
      "hints": [
        "Krypton",
        "Cape",
        "Metropolis"
      ]
    },
    {
      "word": "Wonder Woman",
      "hints": [
        "Lasso",
        "Amazon",
        "Shield"
      ]
    },
    {
      "word": "X-Men",
      "hints": [
        "Mutants",
        "Wolverine",
        "School"
      ]
    },
    {
      "word": "Joker",
      "hints": [
        "Clown",
        "Stairs",
        "Society"
      ]
    },
    {
      "word": "Deadpool",
      "hints": [
        "Fourth",
        "Wall",
        "Chimichangas"
      ]
    },
    {
      "word": "Black Panther",
      "hints": [
        "Wakanda",
        "Vibranium",
        "King"
      ]
    },
    {
      "word": "Iron Man",
      "hints": [
        "Suit",
        "Stark",
        "Arc"
      ]
    },
    {
      "word": "Captain America",
      "hints": [
        "Shield",
        "Ice",
        "Steve"
      ]
    },
    {
      "word": "Thor",
      "hints": [
        "Hammer",
        "Lightning",
        "Asgard"
      ]
    },
    {
      "word": "Guardians",
      "hints": [
        "Galaxy",
        "Tree",
        "Raccoon"
      ]
    },
    {
      "word": "James Bond",
      "hints": [
        "Spy",
        "Martini",
        "007"
      ]
    },
    {
      "word": "Mission Impossible",
      "hints": [
        "Cruise",
        "Stunts",
        "Masks"
      ]
    },
    {
      "word": "Fast and Furious",
      "hints": [
        "Family",
        "Cars",
        "Racing"
      ]
    },
    {
      "word": "Transformers",
      "hints": [
        "Autobots",
        "Disguise",
        "Robots"
      ]
    },
    {
      "word": "Pirates",
      "hints": [
        "Caribbean",
        "Sparrow",
        "Ship"
      ]
    },
    {
      "word": "The Hunger Games",
      "hints": [
        "Mockingjay",
        "Katniss",
        "District"
      ]
    },
    {
      "word": "Twilight",
      "hints": [
        "Vampires",
        "Sparkle",
        "Bella"
      ]
    },
    {
      "word": "The Hobbit",
      "hints": [
        "Bilbo",
        "Dragon",
        "Dwarves"
      ]
    },
    {
      "word": "Dune",
      "hints": [
        "Spice",
        "Sandworm",
        "Arrakis"
      ]
    },
    {
      "word": "Interstellar",
      "hints": [
        "Black",
        "Hole",
        "Time"
      ]
    },
    {
      "word": "Gravity",
      "hints": [
        "Space",
        "Debris",
        "Tether"
      ]
    },
    {
      "word": "The Martian",
      "hints": [
        "Potatoes",
        "Mars",
        "Duct"
      ]
    },
    {
      "word": "Arrival",
      "hints": [
        "Language",
        "Aliens",
        "Circular"
      ]
    },
    {
      "word": "Blade Runner 2049",
      "hints": [
        "Hologram",
        "Gosling",
        "Snow"
      ]
    },
    {
      "word": "Mad Max Fury Road",
      "hints": [
        "Valhalla",
        "Guitar",
        "Desert"
      ]
    },
    {
      "word": "Parasite",
      "hints": [
        "Basement",
        "Rich",
        "Poor"
      ]
    },
    {
      "word": "Everything Everywhere",
      "hints": [
        "Bagel",
        "Multiverse",
        "Fingers"
      ]
    },
    {
      "word": "La La Land",
      "hints": [
        "Musical",
        "Jazz",
        "Stars"
      ]
    },
    {
      "word": "Whiplash",
      "hints": [
        "Drums",
        "Tempo",
        "Rush"
      ]
    },
    {
      "word": "Birdman",
      "hints": [
        "Theater",
        "Take",
        "Wings"
      ]
    },
    {
      "word": "The Revenant",
      "hints": [
        "Bear",
        "Snow",
        "Leo"
      ]
    },
    {
      "word": "Jojo Rabbit",
      "hints": [
        "Hitler",
        "Shoes",
        "Camp"
      ]
    },
    {
      "word": "Get Out",
      "hints": [
        "Sunken",
        "Place",
        "Tea"
      ]
    },
    {
      "word": "Us",
      "hints": [
        "Tethered",
        "Scissors",
        "Red"
      ]
    },
    {
      "word": "Nope",
      "hints": [
        "Cloud",
        "UFO",
        "Horses"
      ]
    },
    {
      "word": "Hereditary",
      "hints": [
        "Head",
        "Treehouse",
        "Click"
      ]
    },
    {
      "word": "Midsommar",
      "hints": [
        "Flower",
        "Crown",
        "Cult"
      ]
    },
    {
      "word": "The Witch",
      "hints": [
        "Goat",
        "Butter",
        "Puritan"
      ]
    },
    {
      "word": "The Lighthouse",
      "hints": [
        "Gull",
        "Beans",
        "Mermaid"
      ]
    },
    {
      "word": "Uncut Gems",
      "hints": [
        "Opal",
        "Bet",
        "Adam"
      ]
    },
    {
      "word": "Goodfellas",
      "hints": [
        "Mob",
        "Funny",
        "Pasta"
      ]
    },
    {
      "word": "Casino",
      "hints": [
        "Vegas",
        "Mob",
        "Desert"
      ]
    },
    {
      "word": "The Wolf of Wall Street",
      "hints": [
        "Stocks",
        "Quaaludes",
        "Chest"
      ]
    },
    {
      "word": "Catch Me If You Can",
      "hints": [
        "Pilot",
        "Checks",
        "Chase"
      ]
    },
    {
      "word": "Schindlers List",
      "hints": [
        "Red",
        "Coat",
        "Factory"
      ]
    },
    {
      "word": "Saving Private Ryan",
      "hints": [
        "Beach",
        "Brother",
        "Normandy"
      ]
    },
    {
      "word": "Amadeus",
      "hints": [
        "Mozart",
        "Salieri",
        "Laugh"
      ]
    },
    {
      "word": "A Clockwork Orange",
      "hints": [
        "Milk",
        "Eyes",
        "Beethoven"
      ]
    },
    {
      "word": "2001 A Space Odyssey",
      "hints": [
        "Monolith",
        "HAL",
        "Bone"
      ]
    },
    {
      "word": "The Truman Show",
      "hints": [
        "Dome",
        "TV",
        "Morning"
      ]
    },
    {
      "word": "Eternal Sunshine",
      "hints": [
        "Memory",
        "Erase",
        "Ice"
      ]
    },
    {
      "word": "Her",
      "hints": [
        "AI",
        "OS",
        "Voice"
      ]
    },
    {
      "word": "Ex Machina",
      "hints": [
        "Robot",
        "Turing",
        "Dance"
      ]
    },
    {
      "word": "The Social Network",
      "hints": [
        "Facebook",
        "Harvard",
        "Code"
      ]
    },
    {
      "word": "Zodiac",
      "hints": [
        "Cipher",
        "San",
        "Francisco"
      ]
    },
    {
      "word": "Se7en",
      "hints": [
        "Box",
        "Sins",
        "Rain"
      ]
    },
    {
      "word": "Silence of the Lambs",
      "hints": [
        "Lecter",
        "Moth",
        "Fava"
      ]
    },
    {
      "word": "Psycho",
      "hints": [
        "Shower",
        "Motel",
        "Mother"
      ]
    },
    {
      "word": "Vertigo",
      "hints": [
        "Tower",
        "Heights",
        "Swirl"
      ]
    },
    {
      "word": "Rear Window",
      "hints": [
        "Cast",
        "Binoculars",
        "Neighbor"
      ]
    },
    {
      "word": "North by Northwest",
      "hints": [
        "Crop",
        "Duster",
        "Rushmore"
      ]
    },
    {
      "word": "Casablanca",
      "hints": [
        "Piano",
        "Paris",
        "Airport"
      ]
    },
    {
      "word": "Citizen Kane",
      "hints": [
        "Rosebud",
        "Sled",
        "Newspaper"
      ]
    },
    {
      "word": "Gone with the Wind",
      "hints": [
        "Tara",
        "Frankly",
        "Curtain"
      ]
    },
    {
      "word": "The Wizard of Oz",
      "hints": [
        "Tornado",
        "Shoes",
        "Yellow"
      ]
    },
    {
      "word": "Singin in the Rain",
      "hints": [
        "Umbrella",
        "Puddle",
        "Musical"
      ]
    },
    {
      "word": "Some Like It Hot",
      "hints": [
        "Drag",
        "Band",
        "Train"
      ]
    },
    {
      "word": "12 Angry Men",
      "hints": [
        "Jury",
        "Room",
        "Guilty"
      ]
    },
    {
      "word": "To Kill a Mockingbird",
      "hints": [
        "Atticus",
        "Scout",
        "Trial"
      ]
    },
    {
      "word": "The Good, the Bad",
      "hints": [
        "Ugly",
        "Standoff",
        "Gold"
      ]
    },
    {
      "word": "Once Upon a Time",
      "hints": [
        "West",
        "Harmonica",
        "Revenge"
      ]
    },
    {
      "word": "Taxi Driver",
      "hints": [
        "Mohawk",
        "Mirror",
        "Cab"
      ]
    },
    {
      "word": "Raging Bull",
      "hints": [
        "Boxer",
        "Weight",
        "Brother"
      ]
    },
    {
      "word": "Apocalypse Now",
      "hints": [
        "Napalm",
        "Smell",
        "River"
      ]
    },
    {
      "word": "The Deer Hunter",
      "hints": [
        "Roulette",
        "Vietnam",
        "Wedding"
      ]
    },
    {
      "word": "Platoon",
      "hints": [
        "Knees",
        "Arms",
        "Jungle"
      ]
    },
    {
      "word": "Full Metal Jacket",
      "hints": [
        "Drill",
        "Instructor",
        "Helmet"
      ]
    },
    {
      "word": "The Big Lebowski",
      "hints": [
        "Rug",
        "Bowling",
        "Dude"
      ]
    },
    {
      "word": "Fargo",
      "hints": [
        "Woodchipper",
        "Snow",
        "Minnesota"
      ]
    },
    {
      "word": "No Country for Old Men",
      "hints": [
        "Coin",
        "Toss",
        "Air"
      ]
    },
    {
      "word": "There Will Be Blood",
      "hints": [
        "Milkshake",
        "Oil",
        "Bowling"
      ]
    },
    {
      "word": "Boogie Nights",
      "hints": [
        "Porn",
        "Roller",
        "70s"
      ]
    },
    {
      "word": "Magnolia",
      "hints": [
        "Frogs",
        "Rain",
        "Interconnected"
      ]
    },
    {
      "word": "Punch-Drunk Love",
      "hints": [
        "Pudding",
        "Harmonium",
        "Suit"
      ]
    }
  ]
}
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/movies.json' -Value $jsonContent -Encoding UTF8

$tsContent = @'
import type { WordEntry } from '../../../types/packs'

export const MUSIC_PACK: WordEntry[] = [
  { "id": "music_1", "word": "Guitar", "category": "Music", "hints": ["Strings", "Strum", "Frets"] },
  { "id": "music_2", "word": "Piano", "category": "Music", "hints": ["Keys", "Grand", "Pedals"] },
  { "id": "music_3", "word": "Drums", "category": "Music", "hints": ["Sticks", "Snare", "Kick"] },
  { "id": "music_4", "word": "Bass", "category": "Music", "hints": ["Low", "Four", "Groove"] },
  { "id": "music_5", "word": "Violin", "category": "Music", "hints": ["Bow", "Chin", "Orchestra"] },
  { "id": "music_6", "word": "Cello", "category": "Music", "hints": ["Bow", "Seated", "Large"] },
  { "id": "music_7", "word": "Flute", "category": "Music", "hints": ["Woodwind", "Blow", "Silver"] },
  { "id": "music_8", "word": "Trumpet", "category": "Music", "hints": ["Brass", "Valves", "Jazz"] },
  { "id": "music_9", "word": "Saxophone", "category": "Music", "hints": ["Jazz", "Brass", "Reed"] },
  { "id": "music_10", "word": "Microphone", "category": "Music", "hints": ["Sing", "Stand", "Vocal"] },
  { "id": "music_11", "word": "Synthesizer", "category": "Music", "hints": ["Electronic", "Keys", "Knobs"] },
  { "id": "music_12", "word": "Turntable", "category": "Music", "hints": ["Vinyl", "Scratch", "DJ"] },
  { "id": "music_13", "word": "The Beatles", "category": "Music", "hints": ["John", "Paul", "Abbey"] },
  { "id": "music_14", "word": "Elvis Presley", "category": "Music", "hints": ["King", "Rock", "Hips"] },
  { "id": "music_15", "word": "Michael Jackson", "category": "Music", "hints": ["Moonwalk", "Thriller", "Pop"] },
  { "id": "music_16", "word": "Madonna", "category": "Music", "hints": ["Material", "Girl", "Pop"] },
  { "id": "music_17", "word": "Queen", "category": "Music", "hints": ["Bohemian", "Freddie", "Rock"] },
  { "id": "music_18", "word": "David Bowie", "category": "Music", "hints": ["Starman", "Ziggy", "Space"] },
  { "id": "music_19", "word": "Prince", "category": "Music", "hints": ["Purple", "Rain", "Symbol"] },
  { "id": "music_20", "word": "Elton John", "category": "Music", "hints": ["Rocket", "Glasses", "Piano"] },
  { "id": "music_21", "word": "Bob Dylan", "category": "Music", "hints": ["Folk", "Harmonica", "Tambourine"] },
  { "id": "music_22", "word": "Rolling Stones", "category": "Music", "hints": ["Mick", "Lips", "Satisfaction"] },
  { "id": "music_23", "word": "Led Zeppelin", "category": "Music", "hints": ["Stairway", "Rock", "Blimp"] },
  { "id": "music_24", "word": "Pink Floyd", "category": "Music", "hints": ["Wall", "Prism", "Moon"] },
  { "id": "music_25", "word": "Nirvana", "category": "Music", "hints": ["Grunge", "Teen", "Spirit"] },
  { "id": "music_26", "word": "Eminem", "category": "Music", "hints": ["Rap", "Slim", "Shady"] },
  { "id": "music_27", "word": "Tupac", "category": "Music", "hints": ["Rap", "Hologram", "West"] },
  { "id": "music_28", "word": "Biggie", "category": "Music", "hints": ["Smalls", "Notorious", "Brooklyn"] },
  { "id": "music_29", "word": "Jay-Z", "category": "Music", "hints": ["Brooklyn", "Empire", "State"] },
  { "id": "music_30", "word": "Kanye West", "category": "Music", "hints": ["Yeezy", "College", "Dropout"] },
  { "id": "music_31", "word": "Drake", "category": "Music", "hints": ["Canadian", "Views", "Hotline"] },
  { "id": "music_32", "word": "Kendrick Lamar", "category": "Music", "hints": ["Compton", "Pulitzer", "DNA"] },
  { "id": "music_33", "word": "Beyonce", "category": "Music", "hints": ["Queen", "Destiny", "Lemonade"] },
  { "id": "music_34", "word": "Rihanna", "category": "Music", "hints": ["Umbrella", "Diamonds", "Fenty"] },
  { "id": "music_35", "word": "Taylor Swift", "category": "Music", "hints": ["Eras", "Folklore", "Red"] },
  { "id": "music_36", "word": "Adele", "category": "Music", "hints": ["Hello", "British", "Vocal"] },
  { "id": "music_37", "word": "Ed Sheeran", "category": "Music", "hints": ["Ginger", "Loop", "Math"] },
  { "id": "music_38", "word": "Justin Bieber", "category": "Music", "hints": ["Baby", "Canadian", "Purpose"] },
  { "id": "music_39", "word": "Ariana Grande", "category": "Music", "hints": ["Ponytail", "Whistle", "Thank"] },
  { "id": "music_40", "word": "Lady Gaga", "category": "Music", "hints": ["Meat", "Dress", "Poker"] },
  { "id": "music_41", "word": "Katy Perry", "category": "Music", "hints": ["Roar", "Firework", "Shark"] },
  { "id": "music_42", "word": "Billie Eilish", "category": "Music", "hints": ["Green", "Hair", "Guy"] },
  { "id": "music_43", "word": "The Weeknd", "category": "Music", "hints": ["Blinding", "Lights", "Starboy"] },
  { "id": "music_44", "word": "Bruno Mars", "category": "Music", "hints": ["Uptown", "Funk", "Hooligans"] },
  { "id": "music_45", "word": "Coldplay", "category": "Music", "hints": ["Yellow", "Stars", "British"] },
  { "id": "music_46", "word": "Maroon 5", "category": "Music", "hints": ["Adam", "Moves", "Jagger"] },
  { "id": "music_47", "word": "Imagine Dragons", "category": "Music", "hints": ["Radioactive", "Believer", "Rock"] },
  { "id": "music_48", "word": "Arctic Monkeys", "category": "Music", "hints": ["British", "Indie", "Margarita"] },
  { "id": "music_49", "word": "The Strokes", "category": "Music", "hints": ["New", "York", "Garage"] },
  { "id": "music_50", "word": "Radiohead", "category": "Music", "hints": ["Creep", "Computer", "Yorke"] },
  { "id": "music_51", "word": "Daft Punk", "category": "Music", "hints": ["Helmets", "French", "Electronic"] },
  { "id": "music_52", "word": "Skrillex", "category": "Music", "hints": ["Dubstep", "Drop", "Hair"] },
  { "id": "music_53", "word": "Calvin Harris", "category": "Music", "hints": ["DJ", "Summer", "Vegas"] },
  { "id": "music_54", "word": "Avicii", "category": "Music", "hints": ["Levels", "Swedish", "DJ"] },
  { "id": "music_55", "word": "David Guetta", "category": "Music", "hints": ["Titanium", "French", "DJ"] },
  { "id": "music_56", "word": "Metallica", "category": "Music", "hints": ["Master", "Puppets", "Metal"] },
  { "id": "music_57", "word": "Iron Maiden", "category": "Music", "hints": ["Eddie", "Beast", "Metal"] },
  { "id": "music_58", "word": "Black Sabbath", "category": "Music", "hints": ["Ozzy", "Doom", "Bats"] },
  { "id": "music_59", "word": "AC/DC", "category": "Music", "hints": ["Thunder", "School", "Rock"] },
  { "id": "music_60", "word": "Guns N Roses", "category": "Music", "hints": ["Slash", "Jungle", "Rose"] },
  { "id": "music_61", "word": "Red Hot Chili", "category": "Music", "hints": ["Peppers", "California", "Socks"] },
  { "id": "music_62", "word": "Foo Fighters", "category": "Music", "hints": ["Dave", "Grohl", "Pretender"] },
  { "id": "music_63", "word": "Green Day", "category": "Music", "hints": ["Idiot", "Punk", "September"] },
  { "id": "music_64", "word": "Blink-182", "category": "Music", "hints": ["Small", "Things", "Punk"] },
  { "id": "music_65", "word": "My Chemical", "category": "Music", "hints": ["Romance", "Parade", "Emo"] },
  { "id": "music_66", "word": "Fall Out Boy", "category": "Music", "hints": ["Sugar", "Dance", "Emo"] },
  { "id": "music_67", "word": "Paramore", "category": "Music", "hints": ["Misery", "Business", "Hayley"] },
  { "id": "music_68", "word": "Panic At The", "category": "Music", "hints": ["Disco", "Sins", "Brendon"] },
  { "id": "music_69", "word": "Twenty One Pilots", "category": "Music", "hints": ["Stressed", "Out", "Blurryface"] },
  { "id": "music_70", "word": "Gorillaz", "category": "Music", "hints": ["Virtual", "Band", "Apes"] },
  { "id": "music_71", "word": "Tame Impala", "category": "Music", "hints": ["Australian", "Psychedelic", "Kevin"] },
  { "id": "music_72", "word": "Frank Ocean", "category": "Music", "hints": ["Blonde", "R&B", "Channel"] },
  { "id": "music_73", "word": "Tyler The Creator", "category": "Music", "hints": ["Igor", "Golf", "Wang"] },
  { "id": "music_74", "word": "Childish Gambino", "category": "Music", "hints": ["America", "Donald", "Glover"] },
  { "id": "music_75", "word": "J. Cole", "category": "Music", "hints": ["Fayetteville", "Platinum", "Features"] },
  { "id": "music_76", "word": "Travis Scott", "category": "Music", "hints": ["Astroworld", "Sicko", "Mode"] },
  { "id": "music_77", "word": "Post Malone", "category": "Music", "hints": ["Tattoos", "Circles", "White"] },
  { "id": "music_78", "word": "Lil Nas X", "category": "Music", "hints": ["Old", "Town", "Road"] },
  { "id": "music_79", "word": "Megan Thee", "category": "Music", "hints": ["Stallion", "Savage", "Knees"] },
  { "id": "music_80", "word": "Cardi B", "category": "Music", "hints": ["Bodak", "Yellow", "WAP"] },
  { "id": "music_81", "word": "Nicki Minaj", "category": "Music", "hints": ["Anaconda", "Pink", "Barbz"] },
  { "id": "music_82", "word": "Doja Cat", "category": "Music", "hints": ["Say", "So", "Cow"] },
  { "id": "music_83", "word": "Dua Lipa", "category": "Music", "hints": ["Levitating", "Rules", "Future"] },
  { "id": "music_84", "word": "Olivia Rodrigo", "category": "Music", "hints": ["License", "Sour", "Driver"] },
  { "id": "music_85", "word": "Harry Styles", "category": "Music", "hints": ["Watermelon", "Sugar", "Direction"] },
  { "id": "music_86", "word": "BTS", "category": "Music", "hints": ["K-Pop", "Army", "Dynamite"] },
  { "id": "music_87", "word": "Blackpink", "category": "Music", "hints": ["K-Pop", "Area", "Venom"] },
  { "id": "music_88", "word": "Bad Bunny", "category": "Music", "hints": ["Reggaeton", "Puerto", "Rico"] },
  { "id": "music_89", "word": "J Balvin", "category": "Music", "hints": ["Mi", "Gente", "Reggaeton"] },
  { "id": "music_90", "word": "Rosalia", "category": "Music", "hints": ["Motomami", "Spanish", "Flamenco"] },
  { "id": "music_91", "word": "Jazz", "category": "Music", "hints": ["Improv", "Swing", "Brass"] },
  { "id": "music_92", "word": "Blues", "category": "Music", "hints": ["Sad", "Mississippi", "Guitar"] },
  { "id": "music_93", "word": "Country", "category": "Music", "hints": ["Boots", "Truck", "Twang"] },
  { "id": "music_94", "word": "Hip Hop", "category": "Music", "hints": ["Rap", "Beats", "MC"] },
  { "id": "music_95", "word": "R&B", "category": "Music", "hints": ["Rhythm", "Soul", "Vocals"] },
  { "id": "music_96", "word": "Rock", "category": "Music", "hints": ["Roll", "Guitars", "Loud"] },
  { "id": "music_97", "word": "Pop", "category": "Music", "hints": ["Charts", "Catchy", "Mainstream"] },
  { "id": "music_98", "word": "Classical", "category": "Music", "hints": ["Orchestra", "Symphony", "Mozart"] },
  { "id": "music_99", "word": "Electronic", "category": "Music", "hints": ["Synths", "Dance", "Beats"] },
  { "id": "music_100", "word": "Reggae", "category": "Music", "hints": ["Jamaica", "Bob", "Marley"] },
  { "id": "music_101", "word": "Folk", "category": "Music", "hints": ["Acoustic", "Story", "Traditional"] },
  { "id": "music_102", "word": "Punk", "category": "Music", "hints": ["Fast", "Rebel", "Loud"] },
  { "id": "music_103", "word": "Metal", "category": "Music", "hints": ["Heavy", "Scream", "Distortion"] },
  { "id": "music_104", "word": "Disco", "category": "Music", "hints": ["Ball", "Dance", "70s"] },
  { "id": "music_105", "word": "Funk", "category": "Music", "hints": ["Groove", "Bass", "Slap"] },
  { "id": "music_106", "word": "Soul", "category": "Music", "hints": ["Vocals", "Motown", "Emotion"] },
  { "id": "music_107", "word": "Gospel", "category": "Music", "hints": ["Church", "Choir", "Praise"] },
  { "id": "music_108", "word": "Opera", "category": "Music", "hints": ["Vocal", "Italian", "Theater"] },
  { "id": "music_109", "word": "Symphony", "category": "Music", "hints": ["Orchestra", "Movements", "Conductor"] },
  { "id": "music_110", "word": "Chorus", "category": "Music", "hints": ["Singers", "Group", "Refrain"] },
  { "id": "music_111", "word": "Acapella", "category": "Music", "hints": ["No", "Instruments", "Pitch"] },
  { "id": "music_112", "word": "Tempo", "category": "Music", "hints": ["Speed", "BPM", "Fast"] },
  { "id": "music_113", "word": "Rhythm", "category": "Music", "hints": ["Beat", "Groove", "Timing"] },
  { "id": "music_114", "word": "Melody", "category": "Music", "hints": ["Tune", "Sing", "Main"] },
  { "id": "music_115", "word": "Harmony", "category": "Music", "hints": ["Chords", "Together", "Voices"] },
  { "id": "music_116", "word": "Chord", "category": "Music", "hints": ["Notes", "Together", "Guitar"] },
  { "id": "music_117", "word": "Scale", "category": "Music", "hints": ["Notes", "Order", "Practice"] },
  { "id": "music_118", "word": "Octave", "category": "Music", "hints": ["Eight", "Notes", "Higher"] },
  { "id": "music_119", "word": "Treble", "category": "Music", "hints": ["Clef", "High", "Staff"] },
  { "id": "music_120", "word": "Bass Clef", "category": "Music", "hints": ["Low", "Staff", "Notes"] },
  { "id": "music_121", "word": "Sheet Music", "category": "Music", "hints": ["Paper", "Read", "Notes"] }
] as const
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/packs/music.ts' -Value $tsContent -Encoding UTF8

$jsonContent = @'
{
  "id": "music",
  "name": "Music",
  "emoji": "\ud83c\udfb5",
  "description": "Artists, instruments, and genres.",
  "words": [
    {
      "word": "Guitar",
      "hints": [
        "Strings",
        "Strum",
        "Frets"
      ]
    },
    {
      "word": "Piano",
      "hints": [
        "Keys",
        "Grand",
        "Pedals"
      ]
    },
    {
      "word": "Drums",
      "hints": [
        "Sticks",
        "Snare",
        "Kick"
      ]
    },
    {
      "word": "Bass",
      "hints": [
        "Low",
        "Four",
        "Groove"
      ]
    },
    {
      "word": "Violin",
      "hints": [
        "Bow",
        "Chin",
        "Orchestra"
      ]
    },
    {
      "word": "Cello",
      "hints": [
        "Bow",
        "Seated",
        "Large"
      ]
    },
    {
      "word": "Flute",
      "hints": [
        "Woodwind",
        "Blow",
        "Silver"
      ]
    },
    {
      "word": "Trumpet",
      "hints": [
        "Brass",
        "Valves",
        "Jazz"
      ]
    },
    {
      "word": "Saxophone",
      "hints": [
        "Jazz",
        "Brass",
        "Reed"
      ]
    },
    {
      "word": "Microphone",
      "hints": [
        "Sing",
        "Stand",
        "Vocal"
      ]
    },
    {
      "word": "Synthesizer",
      "hints": [
        "Electronic",
        "Keys",
        "Knobs"
      ]
    },
    {
      "word": "Turntable",
      "hints": [
        "Vinyl",
        "Scratch",
        "DJ"
      ]
    },
    {
      "word": "The Beatles",
      "hints": [
        "John",
        "Paul",
        "Abbey"
      ]
    },
    {
      "word": "Elvis Presley",
      "hints": [
        "King",
        "Rock",
        "Hips"
      ]
    },
    {
      "word": "Michael Jackson",
      "hints": [
        "Moonwalk",
        "Thriller",
        "Pop"
      ]
    },
    {
      "word": "Madonna",
      "hints": [
        "Material",
        "Girl",
        "Pop"
      ]
    },
    {
      "word": "Queen",
      "hints": [
        "Bohemian",
        "Freddie",
        "Rock"
      ]
    },
    {
      "word": "David Bowie",
      "hints": [
        "Starman",
        "Ziggy",
        "Space"
      ]
    },
    {
      "word": "Prince",
      "hints": [
        "Purple",
        "Rain",
        "Symbol"
      ]
    },
    {
      "word": "Elton John",
      "hints": [
        "Rocket",
        "Glasses",
        "Piano"
      ]
    },
    {
      "word": "Bob Dylan",
      "hints": [
        "Folk",
        "Harmonica",
        "Tambourine"
      ]
    },
    {
      "word": "Rolling Stones",
      "hints": [
        "Mick",
        "Lips",
        "Satisfaction"
      ]
    },
    {
      "word": "Led Zeppelin",
      "hints": [
        "Stairway",
        "Rock",
        "Blimp"
      ]
    },
    {
      "word": "Pink Floyd",
      "hints": [
        "Wall",
        "Prism",
        "Moon"
      ]
    },
    {
      "word": "Nirvana",
      "hints": [
        "Grunge",
        "Teen",
        "Spirit"
      ]
    },
    {
      "word": "Eminem",
      "hints": [
        "Rap",
        "Slim",
        "Shady"
      ]
    },
    {
      "word": "Tupac",
      "hints": [
        "Rap",
        "Hologram",
        "West"
      ]
    },
    {
      "word": "Biggie",
      "hints": [
        "Smalls",
        "Notorious",
        "Brooklyn"
      ]
    },
    {
      "word": "Jay-Z",
      "hints": [
        "Brooklyn",
        "Empire",
        "State"
      ]
    },
    {
      "word": "Kanye West",
      "hints": [
        "Yeezy",
        "College",
        "Dropout"
      ]
    },
    {
      "word": "Drake",
      "hints": [
        "Canadian",
        "Views",
        "Hotline"
      ]
    },
    {
      "word": "Kendrick Lamar",
      "hints": [
        "Compton",
        "Pulitzer",
        "DNA"
      ]
    },
    {
      "word": "Beyonce",
      "hints": [
        "Queen",
        "Destiny",
        "Lemonade"
      ]
    },
    {
      "word": "Rihanna",
      "hints": [
        "Umbrella",
        "Diamonds",
        "Fenty"
      ]
    },
    {
      "word": "Taylor Swift",
      "hints": [
        "Eras",
        "Folklore",
        "Red"
      ]
    },
    {
      "word": "Adele",
      "hints": [
        "Hello",
        "British",
        "Vocal"
      ]
    },
    {
      "word": "Ed Sheeran",
      "hints": [
        "Ginger",
        "Loop",
        "Math"
      ]
    },
    {
      "word": "Justin Bieber",
      "hints": [
        "Baby",
        "Canadian",
        "Purpose"
      ]
    },
    {
      "word": "Ariana Grande",
      "hints": [
        "Ponytail",
        "Whistle",
        "Thank"
      ]
    },
    {
      "word": "Lady Gaga",
      "hints": [
        "Meat",
        "Dress",
        "Poker"
      ]
    },
    {
      "word": "Katy Perry",
      "hints": [
        "Roar",
        "Firework",
        "Shark"
      ]
    },
    {
      "word": "Billie Eilish",
      "hints": [
        "Green",
        "Hair",
        "Guy"
      ]
    },
    {
      "word": "The Weeknd",
      "hints": [
        "Blinding",
        "Lights",
        "Starboy"
      ]
    },
    {
      "word": "Bruno Mars",
      "hints": [
        "Uptown",
        "Funk",
        "Hooligans"
      ]
    },
    {
      "word": "Coldplay",
      "hints": [
        "Yellow",
        "Stars",
        "British"
      ]
    },
    {
      "word": "Maroon 5",
      "hints": [
        "Adam",
        "Moves",
        "Jagger"
      ]
    },
    {
      "word": "Imagine Dragons",
      "hints": [
        "Radioactive",
        "Believer",
        "Rock"
      ]
    },
    {
      "word": "Arctic Monkeys",
      "hints": [
        "British",
        "Indie",
        "Margarita"
      ]
    },
    {
      "word": "The Strokes",
      "hints": [
        "New",
        "York",
        "Garage"
      ]
    },
    {
      "word": "Radiohead",
      "hints": [
        "Creep",
        "Computer",
        "Yorke"
      ]
    },
    {
      "word": "Daft Punk",
      "hints": [
        "Helmets",
        "French",
        "Electronic"
      ]
    },
    {
      "word": "Skrillex",
      "hints": [
        "Dubstep",
        "Drop",
        "Hair"
      ]
    },
    {
      "word": "Calvin Harris",
      "hints": [
        "DJ",
        "Summer",
        "Vegas"
      ]
    },
    {
      "word": "Avicii",
      "hints": [
        "Levels",
        "Swedish",
        "DJ"
      ]
    },
    {
      "word": "David Guetta",
      "hints": [
        "Titanium",
        "French",
        "DJ"
      ]
    },
    {
      "word": "Metallica",
      "hints": [
        "Master",
        "Puppets",
        "Metal"
      ]
    },
    {
      "word": "Iron Maiden",
      "hints": [
        "Eddie",
        "Beast",
        "Metal"
      ]
    },
    {
      "word": "Black Sabbath",
      "hints": [
        "Ozzy",
        "Doom",
        "Bats"
      ]
    },
    {
      "word": "AC/DC",
      "hints": [
        "Thunder",
        "School",
        "Rock"
      ]
    },
    {
      "word": "Guns N Roses",
      "hints": [
        "Slash",
        "Jungle",
        "Rose"
      ]
    },
    {
      "word": "Red Hot Chili",
      "hints": [
        "Peppers",
        "California",
        "Socks"
      ]
    },
    {
      "word": "Foo Fighters",
      "hints": [
        "Dave",
        "Grohl",
        "Pretender"
      ]
    },
    {
      "word": "Green Day",
      "hints": [
        "Idiot",
        "Punk",
        "September"
      ]
    },
    {
      "word": "Blink-182",
      "hints": [
        "Small",
        "Things",
        "Punk"
      ]
    },
    {
      "word": "My Chemical",
      "hints": [
        "Romance",
        "Parade",
        "Emo"
      ]
    },
    {
      "word": "Fall Out Boy",
      "hints": [
        "Sugar",
        "Dance",
        "Emo"
      ]
    },
    {
      "word": "Paramore",
      "hints": [
        "Misery",
        "Business",
        "Hayley"
      ]
    },
    {
      "word": "Panic At The",
      "hints": [
        "Disco",
        "Sins",
        "Brendon"
      ]
    },
    {
      "word": "Twenty One Pilots",
      "hints": [
        "Stressed",
        "Out",
        "Blurryface"
      ]
    },
    {
      "word": "Gorillaz",
      "hints": [
        "Virtual",
        "Band",
        "Apes"
      ]
    },
    {
      "word": "Tame Impala",
      "hints": [
        "Australian",
        "Psychedelic",
        "Kevin"
      ]
    },
    {
      "word": "Frank Ocean",
      "hints": [
        "Blonde",
        "R&B",
        "Channel"
      ]
    },
    {
      "word": "Tyler The Creator",
      "hints": [
        "Igor",
        "Golf",
        "Wang"
      ]
    },
    {
      "word": "Childish Gambino",
      "hints": [
        "America",
        "Donald",
        "Glover"
      ]
    },
    {
      "word": "J. Cole",
      "hints": [
        "Fayetteville",
        "Platinum",
        "Features"
      ]
    },
    {
      "word": "Travis Scott",
      "hints": [
        "Astroworld",
        "Sicko",
        "Mode"
      ]
    },
    {
      "word": "Post Malone",
      "hints": [
        "Tattoos",
        "Circles",
        "White"
      ]
    },
    {
      "word": "Lil Nas X",
      "hints": [
        "Old",
        "Town",
        "Road"
      ]
    },
    {
      "word": "Megan Thee",
      "hints": [
        "Stallion",
        "Savage",
        "Knees"
      ]
    },
    {
      "word": "Cardi B",
      "hints": [
        "Bodak",
        "Yellow",
        "WAP"
      ]
    },
    {
      "word": "Nicki Minaj",
      "hints": [
        "Anaconda",
        "Pink",
        "Barbz"
      ]
    },
    {
      "word": "Doja Cat",
      "hints": [
        "Say",
        "So",
        "Cow"
      ]
    },
    {
      "word": "Dua Lipa",
      "hints": [
        "Levitating",
        "Rules",
        "Future"
      ]
    },
    {
      "word": "Olivia Rodrigo",
      "hints": [
        "License",
        "Sour",
        "Driver"
      ]
    },
    {
      "word": "Harry Styles",
      "hints": [
        "Watermelon",
        "Sugar",
        "Direction"
      ]
    },
    {
      "word": "BTS",
      "hints": [
        "K-Pop",
        "Army",
        "Dynamite"
      ]
    },
    {
      "word": "Blackpink",
      "hints": [
        "K-Pop",
        "Area",
        "Venom"
      ]
    },
    {
      "word": "Bad Bunny",
      "hints": [
        "Reggaeton",
        "Puerto",
        "Rico"
      ]
    },
    {
      "word": "J Balvin",
      "hints": [
        "Mi",
        "Gente",
        "Reggaeton"
      ]
    },
    {
      "word": "Rosalia",
      "hints": [
        "Motomami",
        "Spanish",
        "Flamenco"
      ]
    },
    {
      "word": "Jazz",
      "hints": [
        "Improv",
        "Swing",
        "Brass"
      ]
    },
    {
      "word": "Blues",
      "hints": [
        "Sad",
        "Mississippi",
        "Guitar"
      ]
    },
    {
      "word": "Country",
      "hints": [
        "Boots",
        "Truck",
        "Twang"
      ]
    },
    {
      "word": "Hip Hop",
      "hints": [
        "Rap",
        "Beats",
        "MC"
      ]
    },
    {
      "word": "R&B",
      "hints": [
        "Rhythm",
        "Soul",
        "Vocals"
      ]
    },
    {
      "word": "Rock",
      "hints": [
        "Roll",
        "Guitars",
        "Loud"
      ]
    },
    {
      "word": "Pop",
      "hints": [
        "Charts",
        "Catchy",
        "Mainstream"
      ]
    },
    {
      "word": "Classical",
      "hints": [
        "Orchestra",
        "Symphony",
        "Mozart"
      ]
    },
    {
      "word": "Electronic",
      "hints": [
        "Synths",
        "Dance",
        "Beats"
      ]
    },
    {
      "word": "Reggae",
      "hints": [
        "Jamaica",
        "Bob",
        "Marley"
      ]
    },
    {
      "word": "Folk",
      "hints": [
        "Acoustic",
        "Story",
        "Traditional"
      ]
    },
    {
      "word": "Punk",
      "hints": [
        "Fast",
        "Rebel",
        "Loud"
      ]
    },
    {
      "word": "Metal",
      "hints": [
        "Heavy",
        "Scream",
        "Distortion"
      ]
    },
    {
      "word": "Disco",
      "hints": [
        "Ball",
        "Dance",
        "70s"
      ]
    },
    {
      "word": "Funk",
      "hints": [
        "Groove",
        "Bass",
        "Slap"
      ]
    },
    {
      "word": "Soul",
      "hints": [
        "Vocals",
        "Motown",
        "Emotion"
      ]
    },
    {
      "word": "Gospel",
      "hints": [
        "Church",
        "Choir",
        "Praise"
      ]
    },
    {
      "word": "Opera",
      "hints": [
        "Vocal",
        "Italian",
        "Theater"
      ]
    },
    {
      "word": "Symphony",
      "hints": [
        "Orchestra",
        "Movements",
        "Conductor"
      ]
    },
    {
      "word": "Chorus",
      "hints": [
        "Singers",
        "Group",
        "Refrain"
      ]
    },
    {
      "word": "Acapella",
      "hints": [
        "No",
        "Instruments",
        "Pitch"
      ]
    },
    {
      "word": "Tempo",
      "hints": [
        "Speed",
        "BPM",
        "Fast"
      ]
    },
    {
      "word": "Rhythm",
      "hints": [
        "Beat",
        "Groove",
        "Timing"
      ]
    },
    {
      "word": "Melody",
      "hints": [
        "Tune",
        "Sing",
        "Main"
      ]
    },
    {
      "word": "Harmony",
      "hints": [
        "Chords",
        "Together",
        "Voices"
      ]
    },
    {
      "word": "Chord",
      "hints": [
        "Notes",
        "Together",
        "Guitar"
      ]
    },
    {
      "word": "Scale",
      "hints": [
        "Notes",
        "Order",
        "Practice"
      ]
    },
    {
      "word": "Octave",
      "hints": [
        "Eight",
        "Notes",
        "Higher"
      ]
    },
    {
      "word": "Treble",
      "hints": [
        "Clef",
        "High",
        "Staff"
      ]
    },
    {
      "word": "Bass Clef",
      "hints": [
        "Low",
        "Staff",
        "Notes"
      ]
    },
    {
      "word": "Sheet Music",
      "hints": [
        "Paper",
        "Read",
        "Notes"
      ]
    }
  ]
}
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/music.json' -Value $jsonContent -Encoding UTF8

$tsContent = @'
import type { WordEntry } from '../../../types/packs'

export const PARTY_MODE_PACK: WordEntry[] = [
  { "id": "party-mode_1", "word": "Beer Pong", "category": "Party Mode", "hints": ["Cups", "Ping", "Table"] },
  { "id": "party-mode_2", "word": "Flip Cup", "category": "Party Mode", "hints": ["Edge", "Drink", "Team"] },
  { "id": "party-mode_3", "word": "Kings Cup", "category": "Party Mode", "hints": ["Cards", "Circle", "Rules"] },
  { "id": "party-mode_4", "word": "Truth or Dare", "category": "Party Mode", "hints": ["Question", "Action", "Choice"] },
  { "id": "party-mode_5", "word": "Never Have I", "category": "Party Mode", "hints": ["Ever", "Fingers", "Confess"] },
  { "id": "party-mode_6", "word": "Spin the Bottle", "category": "Party Mode", "hints": ["Kiss", "Circle", "Point"] },
  { "id": "party-mode_7", "word": "Charades", "category": "Party Mode", "hints": ["Act", "Silent", "Guess"] },
  { "id": "party-mode_8", "word": "Pictionary", "category": "Party Mode", "hints": ["Draw", "Guess", "Paper"] },
  { "id": "party-mode_9", "word": "Twister", "category": "Party Mode", "hints": ["Colors", "Dots", "Tangled"] },
  { "id": "party-mode_10", "word": "Jenga", "category": "Party Mode", "hints": ["Blocks", "Tower", "Fall"] },
  { "id": "party-mode_11", "word": "Uno", "category": "Party Mode", "hints": ["Cards", "Colors", "Reverse"] },
  { "id": "party-mode_12", "word": "Cards Against", "category": "Party Mode", "hints": ["Humanity", "Black", "White"] },
  { "id": "party-mode_13", "word": "Apples to", "category": "Party Mode", "hints": ["Apples", "Compare", "Cards"] },
  { "id": "party-mode_14", "word": "Mafia", "category": "Party Mode", "hints": ["Town", "Kill", "Night"] },
  { "id": "party-mode_15", "word": "Werewolf", "category": "Party Mode", "hints": ["Villagers", "Moon", "Bite"] },
  { "id": "party-mode_16", "word": "Secret Hitler", "category": "Party Mode", "hints": ["Fascists", "Liberals", "Board"] },
  { "id": "party-mode_17", "word": "Codenames", "category": "Party Mode", "hints": ["Spies", "Words", "Grid"] },
  { "id": "party-mode_18", "word": "Monopoly", "category": "Party Mode", "hints": ["Money", "Jail", "Board"] },
  { "id": "party-mode_19", "word": "Scrabble", "category": "Party Mode", "hints": ["Letters", "Tiles", "Words"] },
  { "id": "party-mode_20", "word": "Catan", "category": "Party Mode", "hints": ["Sheep", "Wood", "Hexagons"] },
  { "id": "party-mode_21", "word": "Ticket to Ride", "category": "Party Mode", "hints": ["Trains", "Routes", "Board"] },
  { "id": "party-mode_22", "word": "Risk", "category": "Party Mode", "hints": ["Armies", "Conquer", "World"] },
  { "id": "party-mode_23", "word": "Chess", "category": "Party Mode", "hints": ["King", "Queen", "Knights"] },
  { "id": "party-mode_24", "word": "Checkers", "category": "Party Mode", "hints": ["Red", "Black", "Jump"] },
  { "id": "party-mode_25", "word": "Poker", "category": "Party Mode", "hints": ["Chips", "Bluff", "Cards"] },
  { "id": "party-mode_26", "word": "Blackjack", "category": "Party Mode", "hints": ["21", "Dealer", "Hit"] },
  { "id": "party-mode_27", "word": "Roulette", "category": "Party Mode", "hints": ["Wheel", "Red", "Black"] },
  { "id": "party-mode_28", "word": "Craps", "category": "Party Mode", "hints": ["Dice", "Table", "Roll"] },
  { "id": "party-mode_29", "word": "Slots", "category": "Party Mode", "hints": ["Machine", "Coins", "Pull"] },
  { "id": "party-mode_30", "word": "Bingo", "category": "Party Mode", "hints": ["Numbers", "Card", "Shout"] },
  { "id": "party-mode_31", "word": "Karaoke", "category": "Party Mode", "hints": ["Sing", "Mic", "Screen"] },
  { "id": "party-mode_32", "word": "Dance Off", "category": "Party Mode", "hints": ["Moves", "Battle", "Music"] },
  { "id": "party-mode_33", "word": "Limbo", "category": "Party Mode", "hints": ["Low", "Stick", "Bend"] },
  { "id": "party-mode_34", "word": "Piñata", "category": "Party Mode", "hints": ["Hit", "Candy", "Blindfold"] },
  { "id": "party-mode_35", "word": "Musical Chairs", "category": "Party Mode", "hints": ["Sit", "Music", "Stop"] },
  { "id": "party-mode_36", "word": "Hide and Seek", "category": "Party Mode", "hints": ["Count", "Find", "Conceal"] },
  { "id": "party-mode_37", "word": "Tag", "category": "Party Mode", "hints": ["Run", "Touch", "It"] },
  { "id": "party-mode_38", "word": "Dodgeball", "category": "Party Mode", "hints": ["Throw", "Hit", "Catch"] },
  { "id": "party-mode_39", "word": "Kickball", "category": "Party Mode", "hints": ["Foot", "Bases", "Rubber"] },
  { "id": "party-mode_40", "word": "Tug of War", "category": "Party Mode", "hints": ["Rope", "Pull", "Team"] },
  { "id": "party-mode_41", "word": "Sack Race", "category": "Party Mode", "hints": ["Jump", "Bag", "Line"] },
  { "id": "party-mode_42", "word": "Egg and Spoon", "category": "Party Mode", "hints": ["Balance", "Walk", "Drop"] },
  { "id": "party-mode_43", "word": "Three Legged", "category": "Party Mode", "hints": ["Race", "Tie", "Run"] },
  { "id": "party-mode_44", "word": "Water Balloon", "category": "Party Mode", "hints": ["Toss", "Splash", "Throw"] },
  { "id": "party-mode_45", "word": "Slip and Slide", "category": "Party Mode", "hints": ["Water", "Plastic", "Run"] },
  { "id": "party-mode_46", "word": "Bouncy Castle", "category": "Party Mode", "hints": ["Jump", "Inflatable", "Kids"] },
  { "id": "party-mode_47", "word": "Photobooth", "category": "Party Mode", "hints": ["Props", "Pictures", "Strips"] },
  { "id": "party-mode_48", "word": "DJ", "category": "Party Mode", "hints": ["Music", "Mix", "Spin"] },
  { "id": "party-mode_49", "word": "Bartender", "category": "Party Mode", "hints": ["Drinks", "Pour", "Mix"] },
  { "id": "party-mode_50", "word": "Bouncer", "category": "Party Mode", "hints": ["Door", "List", "ID"] },
  { "id": "party-mode_51", "word": "VIP", "category": "Party Mode", "hints": ["Section", "Rope", "Exclusive"] },
  { "id": "party-mode_52", "word": "Red Cup", "category": "Party Mode", "hints": ["Solo", "Drink", "Party"] },
  { "id": "party-mode_53", "word": "Keg", "category": "Party Mode", "hints": ["Stand", "Beer", "Tap"] },
  { "id": "party-mode_54", "word": "Shot", "category": "Party Mode", "hints": ["Glass", "Drink", "Fast"] },
  { "id": "party-mode_55", "word": "Cocktail", "category": "Party Mode", "hints": ["Mix", "Glass", "Drink"] },
  { "id": "party-mode_56", "word": "Mocktail", "category": "Party Mode", "hints": ["Virgin", "Drink", "Juice"] },
  { "id": "party-mode_57", "word": "Champagne", "category": "Party Mode", "hints": ["Pop", "Toast", "Bubbles"] },
  { "id": "party-mode_58", "word": "Wine", "category": "Party Mode", "hints": ["Red", "White", "Grape"] },
  { "id": "party-mode_59", "word": "Margarita", "category": "Party Mode", "hints": ["Tequila", "Lime", "Salt"] },
  { "id": "party-mode_60", "word": "Martini", "category": "Party Mode", "hints": ["Olive", "Gin", "Shaken"] },
  { "id": "party-mode_61", "word": "Mojito", "category": "Party Mode", "hints": ["Mint", "Rum", "Lime"] },
  { "id": "party-mode_62", "word": "Sangria", "category": "Party Mode", "hints": ["Fruit", "Wine", "Pitcher"] },
  { "id": "party-mode_63", "word": "Hangover", "category": "Party Mode", "hints": ["Morning", "Headache", "Regret"] },
  { "id": "party-mode_64", "word": "Pre-game", "category": "Party Mode", "hints": ["Before", "Drink", "Start"] },
  { "id": "party-mode_65", "word": "After-party", "category": "Party Mode", "hints": ["Late", "Next", "Location"] },
  { "id": "party-mode_66", "word": "House Party", "category": "Party Mode", "hints": ["Home", "Music", "Friends"] },
  { "id": "party-mode_67", "word": "Block Party", "category": "Party Mode", "hints": ["Street", "Neighbors", "Food"] },
  { "id": "party-mode_68", "word": "Pool Party", "category": "Party Mode", "hints": ["Swim", "Sun", "Water"] },
  { "id": "party-mode_69", "word": "Beach Party", "category": "Party Mode", "hints": ["Sand", "Ocean", "Fire"] },
  { "id": "party-mode_70", "word": "Tailgate", "category": "Party Mode", "hints": ["Car", "Sports", "Grill"] },
  { "id": "party-mode_71", "word": "Rave", "category": "Party Mode", "hints": ["Glow", "EDM", "Dance"] },
  { "id": "party-mode_72", "word": "Festival", "category": "Party Mode", "hints": ["Music", "Tents", "Crowd"] },
  { "id": "party-mode_73", "word": "Concert", "category": "Party Mode", "hints": ["Live", "Band", "Stage"] },
  { "id": "party-mode_74", "word": "Club", "category": "Party Mode", "hints": ["Dance", "Line", "Music"] },
  { "id": "party-mode_75", "word": "Bar", "category": "Party Mode", "hints": ["Stools", "Drinks", "Tap"] },
  { "id": "party-mode_76", "word": "Pub", "category": "Party Mode", "hints": ["British", "Pints", "Food"] },
  { "id": "party-mode_77", "word": "Dive Bar", "category": "Party Mode", "hints": ["Cheap", "Dark", "Local"] },
  { "id": "party-mode_78", "word": "Speakeasy", "category": "Party Mode", "hints": ["Hidden", "Password", "Retro"] },
  { "id": "party-mode_79", "word": "Happy Hour", "category": "Party Mode", "hints": ["Cheap", "Drinks", "After"] },
  { "id": "party-mode_80", "word": "Toast", "category": "Party Mode", "hints": ["Cheers", "Glass", "Speech"] },
  { "id": "party-mode_81", "word": "Cheers", "category": "Party Mode", "hints": ["Clink", "Drink", "Toast"] },
  { "id": "party-mode_82", "word": "Chug", "category": "Party Mode", "hints": ["Fast", "Drink", "Finish"] },
  { "id": "party-mode_83", "word": "Bottoms Up", "category": "Party Mode", "hints": ["Drink", "All", "Glass"] },
  { "id": "party-mode_84", "word": "Icebreaker", "category": "Party Mode", "hints": ["Game", "Meet", "Start"] },
  { "id": "party-mode_85", "word": "Small Talk", "category": "Party Mode", "hints": ["Weather", "Chat", "Awkward"] },
  { "id": "party-mode_86", "word": "Wingman", "category": "Party Mode", "hints": ["Help", "Friend", "Flirt"] },
  { "id": "party-mode_87", "word": "Third Wheel", "category": "Party Mode", "hints": ["Extra", "Couple", "Awkward"] },
  { "id": "party-mode_88", "word": "Crasher", "category": "Party Mode", "hints": ["Uninvited", "Sneak", "Party"] },
  { "id": "party-mode_89", "word": "Wallflower", "category": "Party Mode", "hints": ["Shy", "Stand", "Alone"] },
  { "id": "party-mode_90", "word": "Life of the", "category": "Party Mode", "hints": ["Party", "Fun", "Center"] },
  { "id": "party-mode_91", "word": "Party Animal", "category": "Party Mode", "hints": ["Wild", "Crazy", "Drink"] },
  { "id": "party-mode_92", "word": "Buzzkill", "category": "Party Mode", "hints": ["Ruin", "Fun", "Stop"] },
  { "id": "party-mode_93", "word": "Irish Exit", "category": "Party Mode", "hints": ["Leave", "No", "Goodbye"] },
  { "id": "party-mode_94", "word": "Designated", "category": "Party Mode", "hints": ["Driver", "Sober", "Car"] },
  { "id": "party-mode_95", "word": "Uber", "category": "Party Mode", "hints": ["Ride", "App", "Home"] },
  { "id": "party-mode_96", "word": "Pizza", "category": "Party Mode", "hints": ["Late", "Slice", "Delivery"] },
  { "id": "party-mode_97", "word": "Tacos", "category": "Party Mode", "hints": ["Late", "Food", "Truck"] },
  { "id": "party-mode_98", "word": "Kebab", "category": "Party Mode", "hints": ["Late", "Meat", "Wrap"] },
  { "id": "party-mode_99", "word": "Diner", "category": "Party Mode", "hints": ["Late", "Food", "Booth"] },
  { "id": "party-mode_100", "word": "Waffle House", "category": "Party Mode", "hints": ["Late", "Food", "Fight"] },
  { "id": "party-mode_101", "word": "Puke", "category": "Party Mode", "hints": ["Sick", "Bathroom", "Too"] },
  { "id": "party-mode_102", "word": "Blackout", "category": "Party Mode", "hints": ["Memory", "Forget", "Drink"] },
  { "id": "party-mode_103", "word": "Cops", "category": "Party Mode", "hints": ["Noise", "Complaint", "Shut"] },
  { "id": "party-mode_104", "word": "Noise Complaint", "category": "Party Mode", "hints": ["Neighbors", "Loud", "Police"] },
  { "id": "party-mode_105", "word": "Clean Up", "category": "Party Mode", "hints": ["Morning", "Trash", "Mess"] },
  { "id": "party-mode_106", "word": "Walk of Shame", "category": "Party Mode", "hints": ["Morning", "Clothes", "Home"] },
  { "id": "party-mode_107", "word": "Sunday Scaries", "category": "Party Mode", "hints": ["Anxiety", "Tomorrow", "Work"] },
  { "id": "party-mode_108", "word": "Brunch", "category": "Party Mode", "hints": ["Morning", "Mimosas", "Eggs"] },
  { "id": "party-mode_109", "word": "Mimosa", "category": "Party Mode", "hints": ["Champagne", "Orange", "Juice"] },
  { "id": "party-mode_110", "word": "Bloody Mary", "category": "Party Mode", "hints": ["Tomato", "Vodka", "Celery"] },
  { "id": "party-mode_111", "word": "Hair of the Dog", "category": "Party Mode", "hints": ["Drink", "Morning", "Cure"] },
  { "id": "party-mode_112", "word": "Gossip", "category": "Party Mode", "hints": ["Talk", "Secrets", "Tea"] },
  { "id": "party-mode_113", "word": "Spill the Tea", "category": "Party Mode", "hints": ["Gossip", "Tell", "Drama"] },
  { "id": "party-mode_114", "word": "Drama", "category": "Party Mode", "hints": ["Fight", "Cry", "Argue"] },
  { "id": "party-mode_115", "word": "Tears", "category": "Party Mode", "hints": ["Cry", "Drunk", "Sad"] },
  { "id": "party-mode_116", "word": "Fight", "category": "Party Mode", "hints": ["Punch", "Argue", "Brawl"] },
  { "id": "party-mode_117", "word": "Bouncer", "category": "Party Mode", "hints": ["Throw", "Out", "Tough"] },
  { "id": "party-mode_118", "word": "Fake ID", "category": "Party Mode", "hints": ["Underage", "Card", "Enter"] }
] as const
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/packs/partyMode.ts' -Value $tsContent -Encoding UTF8

$jsonContent = @'
{
  "id": "party-mode",
  "name": "Party Mode",
  "emoji": "\ud83c\udf89",
  "description": "Drinking games, social terms, and fun.",
  "words": [
    {
      "word": "Beer Pong",
      "hints": [
        "Cups",
        "Ping",
        "Table"
      ]
    },
    {
      "word": "Flip Cup",
      "hints": [
        "Edge",
        "Drink",
        "Team"
      ]
    },
    {
      "word": "Kings Cup",
      "hints": [
        "Cards",
        "Circle",
        "Rules"
      ]
    },
    {
      "word": "Truth or Dare",
      "hints": [
        "Question",
        "Action",
        "Choice"
      ]
    },
    {
      "word": "Never Have I",
      "hints": [
        "Ever",
        "Fingers",
        "Confess"
      ]
    },
    {
      "word": "Spin the Bottle",
      "hints": [
        "Kiss",
        "Circle",
        "Point"
      ]
    },
    {
      "word": "Charades",
      "hints": [
        "Act",
        "Silent",
        "Guess"
      ]
    },
    {
      "word": "Pictionary",
      "hints": [
        "Draw",
        "Guess",
        "Paper"
      ]
    },
    {
      "word": "Twister",
      "hints": [
        "Colors",
        "Dots",
        "Tangled"
      ]
    },
    {
      "word": "Jenga",
      "hints": [
        "Blocks",
        "Tower",
        "Fall"
      ]
    },
    {
      "word": "Uno",
      "hints": [
        "Cards",
        "Colors",
        "Reverse"
      ]
    },
    {
      "word": "Cards Against",
      "hints": [
        "Humanity",
        "Black",
        "White"
      ]
    },
    {
      "word": "Apples to",
      "hints": [
        "Apples",
        "Compare",
        "Cards"
      ]
    },
    {
      "word": "Mafia",
      "hints": [
        "Town",
        "Kill",
        "Night"
      ]
    },
    {
      "word": "Werewolf",
      "hints": [
        "Villagers",
        "Moon",
        "Bite"
      ]
    },
    {
      "word": "Secret Hitler",
      "hints": [
        "Fascists",
        "Liberals",
        "Board"
      ]
    },
    {
      "word": "Codenames",
      "hints": [
        "Spies",
        "Words",
        "Grid"
      ]
    },
    {
      "word": "Monopoly",
      "hints": [
        "Money",
        "Jail",
        "Board"
      ]
    },
    {
      "word": "Scrabble",
      "hints": [
        "Letters",
        "Tiles",
        "Words"
      ]
    },
    {
      "word": "Catan",
      "hints": [
        "Sheep",
        "Wood",
        "Hexagons"
      ]
    },
    {
      "word": "Ticket to Ride",
      "hints": [
        "Trains",
        "Routes",
        "Board"
      ]
    },
    {
      "word": "Risk",
      "hints": [
        "Armies",
        "Conquer",
        "World"
      ]
    },
    {
      "word": "Chess",
      "hints": [
        "King",
        "Queen",
        "Knights"
      ]
    },
    {
      "word": "Checkers",
      "hints": [
        "Red",
        "Black",
        "Jump"
      ]
    },
    {
      "word": "Poker",
      "hints": [
        "Chips",
        "Bluff",
        "Cards"
      ]
    },
    {
      "word": "Blackjack",
      "hints": [
        "21",
        "Dealer",
        "Hit"
      ]
    },
    {
      "word": "Roulette",
      "hints": [
        "Wheel",
        "Red",
        "Black"
      ]
    },
    {
      "word": "Craps",
      "hints": [
        "Dice",
        "Table",
        "Roll"
      ]
    },
    {
      "word": "Slots",
      "hints": [
        "Machine",
        "Coins",
        "Pull"
      ]
    },
    {
      "word": "Bingo",
      "hints": [
        "Numbers",
        "Card",
        "Shout"
      ]
    },
    {
      "word": "Karaoke",
      "hints": [
        "Sing",
        "Mic",
        "Screen"
      ]
    },
    {
      "word": "Dance Off",
      "hints": [
        "Moves",
        "Battle",
        "Music"
      ]
    },
    {
      "word": "Limbo",
      "hints": [
        "Low",
        "Stick",
        "Bend"
      ]
    },
    {
      "word": "Pi\u00f1ata",
      "hints": [
        "Hit",
        "Candy",
        "Blindfold"
      ]
    },
    {
      "word": "Musical Chairs",
      "hints": [
        "Sit",
        "Music",
        "Stop"
      ]
    },
    {
      "word": "Hide and Seek",
      "hints": [
        "Count",
        "Find",
        "Conceal"
      ]
    },
    {
      "word": "Tag",
      "hints": [
        "Run",
        "Touch",
        "It"
      ]
    },
    {
      "word": "Dodgeball",
      "hints": [
        "Throw",
        "Hit",
        "Catch"
      ]
    },
    {
      "word": "Kickball",
      "hints": [
        "Foot",
        "Bases",
        "Rubber"
      ]
    },
    {
      "word": "Tug of War",
      "hints": [
        "Rope",
        "Pull",
        "Team"
      ]
    },
    {
      "word": "Sack Race",
      "hints": [
        "Jump",
        "Bag",
        "Line"
      ]
    },
    {
      "word": "Egg and Spoon",
      "hints": [
        "Balance",
        "Walk",
        "Drop"
      ]
    },
    {
      "word": "Three Legged",
      "hints": [
        "Race",
        "Tie",
        "Run"
      ]
    },
    {
      "word": "Water Balloon",
      "hints": [
        "Toss",
        "Splash",
        "Throw"
      ]
    },
    {
      "word": "Slip and Slide",
      "hints": [
        "Water",
        "Plastic",
        "Run"
      ]
    },
    {
      "word": "Bouncy Castle",
      "hints": [
        "Jump",
        "Inflatable",
        "Kids"
      ]
    },
    {
      "word": "Photobooth",
      "hints": [
        "Props",
        "Pictures",
        "Strips"
      ]
    },
    {
      "word": "DJ",
      "hints": [
        "Music",
        "Mix",
        "Spin"
      ]
    },
    {
      "word": "Bartender",
      "hints": [
        "Drinks",
        "Pour",
        "Mix"
      ]
    },
    {
      "word": "Bouncer",
      "hints": [
        "Door",
        "List",
        "ID"
      ]
    },
    {
      "word": "VIP",
      "hints": [
        "Section",
        "Rope",
        "Exclusive"
      ]
    },
    {
      "word": "Red Cup",
      "hints": [
        "Solo",
        "Drink",
        "Party"
      ]
    },
    {
      "word": "Keg",
      "hints": [
        "Stand",
        "Beer",
        "Tap"
      ]
    },
    {
      "word": "Shot",
      "hints": [
        "Glass",
        "Drink",
        "Fast"
      ]
    },
    {
      "word": "Cocktail",
      "hints": [
        "Mix",
        "Glass",
        "Drink"
      ]
    },
    {
      "word": "Mocktail",
      "hints": [
        "Virgin",
        "Drink",
        "Juice"
      ]
    },
    {
      "word": "Champagne",
      "hints": [
        "Pop",
        "Toast",
        "Bubbles"
      ]
    },
    {
      "word": "Wine",
      "hints": [
        "Red",
        "White",
        "Grape"
      ]
    },
    {
      "word": "Margarita",
      "hints": [
        "Tequila",
        "Lime",
        "Salt"
      ]
    },
    {
      "word": "Martini",
      "hints": [
        "Olive",
        "Gin",
        "Shaken"
      ]
    },
    {
      "word": "Mojito",
      "hints": [
        "Mint",
        "Rum",
        "Lime"
      ]
    },
    {
      "word": "Sangria",
      "hints": [
        "Fruit",
        "Wine",
        "Pitcher"
      ]
    },
    {
      "word": "Hangover",
      "hints": [
        "Morning",
        "Headache",
        "Regret"
      ]
    },
    {
      "word": "Pre-game",
      "hints": [
        "Before",
        "Drink",
        "Start"
      ]
    },
    {
      "word": "After-party",
      "hints": [
        "Late",
        "Next",
        "Location"
      ]
    },
    {
      "word": "House Party",
      "hints": [
        "Home",
        "Music",
        "Friends"
      ]
    },
    {
      "word": "Block Party",
      "hints": [
        "Street",
        "Neighbors",
        "Food"
      ]
    },
    {
      "word": "Pool Party",
      "hints": [
        "Swim",
        "Sun",
        "Water"
      ]
    },
    {
      "word": "Beach Party",
      "hints": [
        "Sand",
        "Ocean",
        "Fire"
      ]
    },
    {
      "word": "Tailgate",
      "hints": [
        "Car",
        "Sports",
        "Grill"
      ]
    },
    {
      "word": "Rave",
      "hints": [
        "Glow",
        "EDM",
        "Dance"
      ]
    },
    {
      "word": "Festival",
      "hints": [
        "Music",
        "Tents",
        "Crowd"
      ]
    },
    {
      "word": "Concert",
      "hints": [
        "Live",
        "Band",
        "Stage"
      ]
    },
    {
      "word": "Club",
      "hints": [
        "Dance",
        "Line",
        "Music"
      ]
    },
    {
      "word": "Bar",
      "hints": [
        "Stools",
        "Drinks",
        "Tap"
      ]
    },
    {
      "word": "Pub",
      "hints": [
        "British",
        "Pints",
        "Food"
      ]
    },
    {
      "word": "Dive Bar",
      "hints": [
        "Cheap",
        "Dark",
        "Local"
      ]
    },
    {
      "word": "Speakeasy",
      "hints": [
        "Hidden",
        "Password",
        "Retro"
      ]
    },
    {
      "word": "Happy Hour",
      "hints": [
        "Cheap",
        "Drinks",
        "After"
      ]
    },
    {
      "word": "Toast",
      "hints": [
        "Cheers",
        "Glass",
        "Speech"
      ]
    },
    {
      "word": "Cheers",
      "hints": [
        "Clink",
        "Drink",
        "Toast"
      ]
    },
    {
      "word": "Chug",
      "hints": [
        "Fast",
        "Drink",
        "Finish"
      ]
    },
    {
      "word": "Bottoms Up",
      "hints": [
        "Drink",
        "All",
        "Glass"
      ]
    },
    {
      "word": "Icebreaker",
      "hints": [
        "Game",
        "Meet",
        "Start"
      ]
    },
    {
      "word": "Small Talk",
      "hints": [
        "Weather",
        "Chat",
        "Awkward"
      ]
    },
    {
      "word": "Wingman",
      "hints": [
        "Help",
        "Friend",
        "Flirt"
      ]
    },
    {
      "word": "Third Wheel",
      "hints": [
        "Extra",
        "Couple",
        "Awkward"
      ]
    },
    {
      "word": "Crasher",
      "hints": [
        "Uninvited",
        "Sneak",
        "Party"
      ]
    },
    {
      "word": "Wallflower",
      "hints": [
        "Shy",
        "Stand",
        "Alone"
      ]
    },
    {
      "word": "Life of the",
      "hints": [
        "Party",
        "Fun",
        "Center"
      ]
    },
    {
      "word": "Party Animal",
      "hints": [
        "Wild",
        "Crazy",
        "Drink"
      ]
    },
    {
      "word": "Buzzkill",
      "hints": [
        "Ruin",
        "Fun",
        "Stop"
      ]
    },
    {
      "word": "Irish Exit",
      "hints": [
        "Leave",
        "No",
        "Goodbye"
      ]
    },
    {
      "word": "Designated",
      "hints": [
        "Driver",
        "Sober",
        "Car"
      ]
    },
    {
      "word": "Uber",
      "hints": [
        "Ride",
        "App",
        "Home"
      ]
    },
    {
      "word": "Pizza",
      "hints": [
        "Late",
        "Slice",
        "Delivery"
      ]
    },
    {
      "word": "Tacos",
      "hints": [
        "Late",
        "Food",
        "Truck"
      ]
    },
    {
      "word": "Kebab",
      "hints": [
        "Late",
        "Meat",
        "Wrap"
      ]
    },
    {
      "word": "Diner",
      "hints": [
        "Late",
        "Food",
        "Booth"
      ]
    },
    {
      "word": "Waffle House",
      "hints": [
        "Late",
        "Food",
        "Fight"
      ]
    },
    {
      "word": "Puke",
      "hints": [
        "Sick",
        "Bathroom",
        "Too"
      ]
    },
    {
      "word": "Blackout",
      "hints": [
        "Memory",
        "Forget",
        "Drink"
      ]
    },
    {
      "word": "Cops",
      "hints": [
        "Noise",
        "Complaint",
        "Shut"
      ]
    },
    {
      "word": "Noise Complaint",
      "hints": [
        "Neighbors",
        "Loud",
        "Police"
      ]
    },
    {
      "word": "Clean Up",
      "hints": [
        "Morning",
        "Trash",
        "Mess"
      ]
    },
    {
      "word": "Walk of Shame",
      "hints": [
        "Morning",
        "Clothes",
        "Home"
      ]
    },
    {
      "word": "Sunday Scaries",
      "hints": [
        "Anxiety",
        "Tomorrow",
        "Work"
      ]
    },
    {
      "word": "Brunch",
      "hints": [
        "Morning",
        "Mimosas",
        "Eggs"
      ]
    },
    {
      "word": "Mimosa",
      "hints": [
        "Champagne",
        "Orange",
        "Juice"
      ]
    },
    {
      "word": "Bloody Mary",
      "hints": [
        "Tomato",
        "Vodka",
        "Celery"
      ]
    },
    {
      "word": "Hair of the Dog",
      "hints": [
        "Drink",
        "Morning",
        "Cure"
      ]
    },
    {
      "word": "Gossip",
      "hints": [
        "Talk",
        "Secrets",
        "Tea"
      ]
    },
    {
      "word": "Spill the Tea",
      "hints": [
        "Gossip",
        "Tell",
        "Drama"
      ]
    },
    {
      "word": "Drama",
      "hints": [
        "Fight",
        "Cry",
        "Argue"
      ]
    },
    {
      "word": "Tears",
      "hints": [
        "Cry",
        "Drunk",
        "Sad"
      ]
    },
    {
      "word": "Fight",
      "hints": [
        "Punch",
        "Argue",
        "Brawl"
      ]
    },
    {
      "word": "Bouncer",
      "hints": [
        "Throw",
        "Out",
        "Tough"
      ]
    },
    {
      "word": "Fake ID",
      "hints": [
        "Underage",
        "Card",
        "Enter"
      ]
    }
  ]
}
'@
Set-Content -Path 'c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/party-mode.json' -Value $jsonContent -Encoding UTF8
