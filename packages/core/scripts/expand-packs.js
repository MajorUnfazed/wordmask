#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'packs', 'data');

function readPack(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writePack(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

// Small helper pools per category to generate plausible words
const pools = {
  technology: [
    'Compiler','Firmware','Microservice','Kernel','Load Balancer','SSL Certificate','Proxy Server','Thread Pool','Garbage Collector','Semaphore','Container Registry','Edge Node','File System','Checksum','Throughput','Heuristic','Backpropagation','Activation Function','Sparse Matrix','Blockchain Node','Consensus','Tokenization','OAuth','SAML','Babel','Polyfill','Type Inference','Static Analysis','Continuous Integration','Continuous Delivery','Hotfix','Rollback','Feature Flag','Telemetry','Observability','Crash Dump','Heap Dump','Profiling','Service Mesh','Ingress Controller','CLI Tool','Package Manager','Monolith','Sidecar','Immutable Infrastructure','Blue Green','Canary Release','Observability','Audit Log','Access Control','Rate Limiter','Key Rotation','Secrets Manager','Feature Toggle'
  ],
  sports: [
    'Corner Kick','Free Throw','Power Play','Set Piece','Double Fault','Officiating','Time Out','Shot Clock','Knockout','Golden Goal','Heel Turn','Backhand','Forehand','Sweep Shot','Layup','Hook Shot','Home Run','Double Play','Fly Ball','Bunt','Strike Zone','Drag Flick','One-Two Pass','Nutmeg','Volley','Pick and Roll','Screen','Alley-oop','Brick','Charge','Hook','Power Clean','Deadlift','Tee Shot','Chip Shot','Approach Shot','Match Point','Sudden Victory','Tie Break','Rain Delay','Yellow Card','Red Card','Sin Bin','Hat Trick','Clean Sheet','Drawn Game'
  ],
  science: [
    'Wavefunction','Catalyst','Isomer','Polymer','Nanotube','Spectroscopy','Ionization','Refraction','Diffraction','Quantum Well','Electrolysis','Thermodynamics','Kinetics','Equilibrium','pH Scale','Redox','Neutrino','Photon','Electron Shell','Valence','Genome','Transcriptome','Ecosystem','Biome','Biomechanics','Cryogenics','Magnetosphere','Ionosphere','Exoplanet','Habitable Zone','Biomechanics','Bioluminescence','Photosphere','Chromatography','Seismograph','Paleoclimate','Genetic Drift','Allele','Mendelian','Hertzsprung–Russell'
  ],
  'random-objects': [
    'Window Blind','Keyring','Cable Tie','Binder','Sticky Note','Shoe Horn','Lint Brush','Bead','Keycap','Door Knob','Screwdriver','Wrench','Hex Key','Rope','Carabiner','Velcro Strap','Lightbulb','Night Light','Fan','Heater','Kettle','Thermos','Lunchbox','Bento Box','Tupperware','Squeezer','Grater','Colander','Spatula','Measuring Jug','Measuring Spoon','Ice Tray'
  ],
  professions: [
    'Cartographer','Archivist','Biostatistician','Conservator','Data Analyst','Forensic Scientist','Hydrologist','Illustrator','Jeweller','Kinesiologist','Linguist','Microbiologist','Neonatologist','Oenologist','Pediatrician','Quantity Surveyor','Radiographer','Soil Scientist','Surveyor','Toxicologist','Urologist','Virologist','Watchmaker','X-ray Technician','Yoga Instructor','Zoologist'
  ],
  'party-mode': [
    'Keg Stand','Spin The Wheel','Flip Cup','Shot Glass','Dance Floor','Strobe Light','Glow Party','Karaoke Set','Photo Montage','Party Hat','Disco Ball','Bumper','DJ Booth','Mix Tape','Afterparty','Close The Bar','Cover Charge','Open Mic','Limousine','Red Solo Cup','Shot Caller','Playlist','Dance Card','Mocktail','Sober Driver','Designated Driver'
  ],
  movies: [
    'Fight Club','The Shawshank Redemption','The Social Network','Goodfellas','The Silence of the Lambs','The Departed','Oldboy','The Prestige','The Godfather Part II','Cinema Paradiso','The Usual Suspects','A Clockwork Orange','Back to the Future','The Terminator','Alien','The Exorcist','The Sixth Sense','The Revenant','Nocturnal Animals','Network','The Good, the Bad and the Ugly','Citizen Kane','Breakfast at Tiffany\'s','Singin\' in the Rain'
  ],
  'internet-culture': [
    'Meme','Viral Video','Substack','Troll Farm','Botnet','Influencer Marketing','Hashtag','Clickbait','Engagement','Impression','Retweet','Like Farming','Microinfluencer','Aggregator','Shadow Profile','Filter Bubble','Deep Link','Cold Take','Hot Take','Trend','FYP','DM','PM','Thread','Viral Loop'
  ],
  geography: [
    'Archipelago','Isthmus','Peninsula','Atoll','Delta','Estuary','Chaparral','Taiga','Mangrove','Savannah','Steppe','Plateau','Badlands','Volcano','Caldera','Bayou','Sound','Channel','Gulf','Basin','Peninsular','Ridge','Escarpment','Butte','Mesa','Archipelago'
  ],
  gaming: [
    'Roguelike','Permadeath','Mana Pool','Experience Points','Level Cap','Sandbox','PvP Arena','PvE Raid','Boss Fight','Spawn Camp','Respawn Timer','Hit Stun','Cooldown','Aggro Table','Patch Day','Dev Diary','Steam Deck','Controller Layout','Input Lag','Hitbox Farming','Side Quest','Collectible','Achievement','Easter Egg Hunt'
  ],
  food: [
    'Shawarma','Ravioli','Bouillabaisse','Gumbo','Okonomiyaki','Souvlaki','Chilaquiles','Pavlova','Caponata','Ratatouille','Cassoulet','Sauerbraten','Pozole','Menudo','Bulgogi','Bibimbap','Congee','Tamale','Empanada','Sushi Roll','Sashimi','Nigiri','Okra Stew','Jollof Rice','Panini','Bratwurst'
  ],
  f1: [
    'Grid','Safety Car','Understeer','Oversteer','Telemetry','ERS','Downforce','Slipstream','Pit Wall','Paddock','Apex','Marshals','Parc Fermé','Chequered Flag','Steward Inquiry','Fuel Load','Tyre Compound','Quali Simulation','Formation Lap','Scrutineering','DNF','Pace Car','Virtual Flag','Hybrid System'
  ],
  everyday: [
    'Billfold','Key Fob','Pet Carrier','Water Bottle','Reusable Bag','Sunglasses Case','Shoe Laces','Car Seat','Booster Seat','Charging Dock','Power Bank','Extension Lead','Router','Modem','Stapler','Hole Punch','Lunchbox','Thermos','Umbrella Stand','Door Mat','Doormat','Bath Mat','Shower Curtain','Laundry Basket','Ironing Board'
  ],
  'campus-life': [
    'Registrar','Provost','Bursar','Tutorial','Lecture Hall','Seminar Room','Lab Coat','TA Office','Syllabus','Credit Transfer','Matriculation','Graduation Gown','Convocation','Alumni Association','Freshers Fayre','Hall Tutor','Resident Assistant','Study Group','Open Day','Exam Board','Office Hours','Module Catalogue'
  ],
  animals: [
    'Armadillo','Basilisk Lizard','Cassowary','Dhole','Echidna','Fennec Fox','Gerenuk','Horseshoe Crab','Ibis','Jacana','Kea','Lemur','Markhor','Nighthawk','Ocelot','Pudu','Quetzal','Rattlesnake','Skink','Tapir','Uakari','Vicuña','Wallaby','Xerus','Yak','Zorilla'
  ]
};

function hintFor(word, packId) {
  // Simple heuristic: split on spaces, pick up to 3 meaningful tokens
  const parts = word.replace(/[:'’]/g, '').split(/\s+/).filter(Boolean);
  const hints = [];
  for (let i = 0; i < Math.min(3, parts.length); i++) {
    hints.push(parts[i].toLowerCase());
  }
  while (hints.length < 3) {
    // fallback hints: use packId, generic words
    if (!hints.includes(packId)) hints.push(packId.split('-')[0]);
    if (hints.length < 3) hints.push('common');
  }
  return hints;
}

function generateCandidates(packId, needed, existing) {
  const pool = pools[packId] || pools[packId.replace('-', '')] || [];
  const results = [];
  let idx = 0;
  // first yield unique items from pool
  for (let i = 0; i < pool.length && results.length < needed; i++) {
    const w = pool[i];
    if (!existing.has(w)) {
      results.push({ word: w, hints: hintFor(w, packId) });
    }
  }
  // then synthesize via adjective + noun using pool nouns
  const adjectives = ['ancient','modern','giant','mini','electric','neon','solar','lunar','quantum','retro','ultra','micro','macro','hyper','silent','noisy','secret','hidden','golden','crimson'];
  while (results.length < needed) {
    const noun = pool[idx % pool.length] || ('item' + idx);
    const adj = adjectives[idx % adjectives.length];
    const candidate = `${adj.charAt(0).toUpperCase()+adj.slice(1)} ${noun}`;
    if (!existing.has(candidate) && !results.some(r=>r.word===candidate)) {
      results.push({ word: candidate, hints: hintFor(candidate, packId) });
    }
    idx++;
    if (idx > 10000) break;
  }
  return results;
}

function expandAll() {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const pack = readPack(filePath);
    const current = pack.words || [];
    const existing = new Set(current.map(w => w.word));
    const target = 120;
    const needed = Math.max(0, target - current.length);
    if (needed === 0) {
      console.log(`${file} already has ${current.length} words`);
      continue;
    }
    const packId = pack.id || path.basename(file, '.json');
    const candidates = generateCandidates(packId, needed, existing);
    console.log(`Adding ${candidates.length} entries to ${file} (was ${current.length})`);
    pack.words = current.concat(candidates);
    writePack(filePath, pack);
  }
}

expandAll();

console.log('Expansion complete.');
