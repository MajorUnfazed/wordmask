import json

categories = {
  "animals": {
    "words": [
      ["Lion", "Big cat"], ["Tiger", "Striped feline"], ["Elephant", "Trunked giant"], ["Giraffe", "Long neck"], ["Zebra", "Striped horse"],
      ["Hippopotamus", "River horse"], ["Rhinoceros", "Horned giant"], ["Cheetah", "Fastest feline"], ["Leopard", "Spotted cat"], ["Jaguar", "Jungle cat"],
      ["Panther", "Black feline"], ["Cougar", "Mountain cat"], ["Lynx", "Tufted ears"], ["Bobcat", "Wild feline"], ["Ocelot", "Small wildcat"],
      ["Wolf", "Howling canine"], ["Fox", "Cunning canine"], ["Coyote", "Desert canine"], ["Jackal", "Wild dog"], ["Dingo", "Australian canine"],
      ["Bear", "Forest giant"], ["Polar Bear", "Arctic giant"], ["Grizzly Bear", "Brown giant"], ["Panda", "Bamboo eater"], ["Koala", "Eucalyptus eater"],
      ["Kangaroo", "Hopping marsupial"], ["Wallaby", "Small hopper"], ["Wombat", "Burrowing marsupial"], ["Tasmanian Devil", "Fierce marsupial"], ["Platypus", "Duck-billed mammal"],
      ["Echidna", "Spiny anteater"], ["Sloth", "Slow mover"], ["Armadillo", "Armored mammal"], ["Anteater", "Insect eater"], ["Aardvark", "Termite eater"],
      ["Bat", "Flying mammal"], ["Monkey", "Tree swinger"], ["Chimpanzee", "Smart ape"], ["Gorilla", "Silverback ape"], ["Orangutan", "Red ape"],
      ["Baboon", "Large monkey"], ["Lemur", "Madagascar primate"], ["Meerkat", "Desert sentry"], ["Mongoose", "Snake killer"], ["Otter", "Playful swimmer"],
      ["Beaver", "Dam builder"], ["Squirrel", "Nut gatherer"], ["Chipmunk", "Striped rodent"], ["Gopher", "Burrowing rodent"], ["Woodchuck", "Groundhog"],
      ["Porcupine", "Spiky rodent"], ["Hedgehog", "Prickly mammal"], ["Skunk", "Smelly mammal"], ["Raccoon", "Masked bandit"], ["Badger", "Fierce digger"],
      ["Weasel", "Sleek hunter"], ["Ferret", "Pet mustelid"], ["Mink", "Valuable fur"], ["Rabbit", "Long ears"], ["Hare", "Fast leaper"],
      ["Deer", "Antlered mammal"], ["Elk", "Large stag"], ["Moose", "Giant antlers"], ["Caribou", "Reindeer"], ["Antelope", "Fast runner"],
      ["Gazelle", "Graceful leaper"], ["Bison", "Prairie giant"], ["Buffalo", "Water grazer"], ["Camel", "Desert humps"], ["Llama", "Andean pack"],
      ["Alpaca", "Woolly grazer"], ["Goat", "Mountain climber"], ["Sheep", "Woolly bleater"], ["Cow", "Milk producer"], ["Pig", "Mud wallower"],
      ["Horse", "Galloping steed"], ["Donkey", "Braying beast"], ["Mule", "Stubborn hybrid"], ["Dog", "Loyal friend"], ["Cat", "Purring pet"],
      ["Mouse", "Tiny squeaker"], ["Rat", "Long tail"], ["Hamster", "Wheel runner"], ["Guinea Pig", "Cavy pet"], ["Gerbil", "Desert pet"],
      ["Chinchilla", "Soft rodent"], ["Whale", "Ocean giant"], ["Dolphin", "Smart swimmer"], ["Porpoise", "Small cetacean"], ["Orca", "Killer cetacean"],
      ["Seal", "Barking pinniped"], ["Sea Lion", "Eared seal"], ["Walrus", "Tusked pinniped"], ["Manatee", "Sea cow"], ["Dugong", "Marine grazer"],
      ["Penguin", "Tuxedo bird"], ["Ostrich", "Running bird"], ["Emu", "Australian runner"], ["Kiwi", "Flightless bird"], ["Flamingo", "Pink wader"],
      ["Heron", "Long-legged fisher"], ["Stork", "Baby bringer"], ["Swan", "Graceful waterfowl"], ["Goose", "Honking bird"], ["Duck", "Quacking swimmer"],
      ["Eagle", "Soaring raptor"], ["Hawk", "Sharp-eyed hunter"], ["Falcon", "Diving raptor"], ["Owl", "Night flyer"], ["Parrot", "Talking bird"],
      ["Macaw", "Colorful flyer"], ["Cockatoo", "Crested parrot"], ["Peacock", "Showy feathers"], ["Turkey", "Gobbling bird"], ["Chicken", "Clucking fowl"],
      ["Pigeon", "City bird"], ["Dove", "Peace symbol"], ["Crow", "Black corvid"], ["Raven", "Large corvid"], ["Woodpecker", "Tree tapper"]
    ]
  },
  "campusLife": {
    "words": [
      ["Dormitory", "Student housing"], ["Roommate", "Living partner"], ["Bunk Bed", "Stacked sleeping"], ["Mini Fridge", "Tiny cooler"], ["Microwave", "Quick heater"],
      ["Cafeteria", "Dining hall"], ["Meal Plan", "Food prepaid"], ["Library", "Study building"], ["Stacks", "Book shelves"], ["Study Room", "Quiet space"],
      ["Lecture Hall", "Big classroom"], ["Professor", "Class teacher"], ["Teaching Assistant", "Helper instructor"], ["Syllabus", "Course outline"], ["Textbook", "Heavy reading"],
      ["Notebook", "Writing pad"], ["Highlighter", "Neon marker"], ["Backpack", "Book carrier"], ["Laptop", "Portable computer"], ["Tablet", "Digital slate"],
      ["Calculator", "Math helper"], ["Flashcards", "Memory aids"], ["Exam", "Big test"], ["Midterm", "Halfway test"], ["Final", "End test"],
      ["Quiz", "Short test"], ["Pop Quiz", "Surprise test"], ["Essay", "Written paper"], ["Term Paper", "Long essay"], ["Thesis", "Final project"],
      ["Dissertation", "Doctoral paper"], ["Research", "Information gathering"], ["Lab", "Science room"], ["Beaker", "Glass vessel"], ["Microscope", "Tiny viewer"],
      ["Telescope", "Star viewer"], ["Art Studio", "Creative space"], ["Easel", "Canvas stand"], ["Theater", "Acting stage"], ["Auditorium", "Performance hall"],
      ["Gymnasium", "Sports building"], ["Stadium", "Sports arena"], ["Fieldhouse", "Indoor sports"], ["Track", "Running oval"], ["Pool", "Swimming area"],
      ["Fraternity", "Brotherhood house"], ["Sorority", "Sisterhood house"], ["Rush Week", "Greek recruitment"], ["Pledge", "New member"], ["Toga Party", "Greek theme"],
      ["Tailgate", "Pre-game party"], ["Mascot", "Team symbol"], ["Cheerleader", "Spirit squad"], ["Marching Band", "Halftime music"], ["Fight Song", "Team anthem"],
      ["Alumni", "Past graduates"], ["Homecoming", "Return celebration"], ["Promenade", "Formal walk"], ["Graduation", "Degree ceremony"], ["Cap", "Flat hat"],
      ["Gown", "Ceremonial robe"], ["Tassel", "Hat string"], ["Diploma", "Degree paper"], ["Valedictorian", "Top student"], ["Dean", "College head"],
      ["Chancellor", "University head"], ["Advisor", "Course guide"], ["Registrar", "Record keeper"], ["Bursar", "Bill collector"], ["Financial Aid", "Money help"],
      ["Scholarship", "Free money"], ["Student Loan", "Borrowed money"], ["Grant", "Given money"], ["Work Study", "Campus job"], ["Internship", "Job practice"],
      ["Career Fair", "Job hunting"], ["Resume", "Job history"], ["Interview", "Job meeting"], ["Student Union", "Campus hub"], ["Bookstore", "Shop on-campus"],
      ["Quad", "Grassy square"], ["Fountain", "Water feature"], ["Statue", "Stone figure"], ["Clock Tower", "Time building"], ["Bell Tower", "Chiming building"],
      ["Bicycle", "Two wheels"], ["Skateboard", "Rolling board"], ["Scooter", "Standing ride"], ["Bus", "Campus transit"], ["Parking Pass", "Car permit"],
      ["Ticket", "Parking fine"], ["Security", "Campus police"], ["ID Card", "Student badge"], ["Lanyard", "Neck strap"], ["Key", "Door opener"],
      ["Laundry", "Clothes washing"], ["Dryer", "Clothes heater"], ["Detergent", "Washing soap"], ["Quarters", "Coin money"], ["Vending Machine", "Snack box"],
      ["Coffee Shop", "Caffeine spot"], ["Espresso", "Strong brew"], ["Latte", "Milk brew"], ["Energy Drink", "Canned boost"], ["Pizza", "Late night slice"],
      ["Ramen", "Cheap noodles"], ["Taco", "Folded shell"], ["Burger", "Meat sandwich"], ["Fries", "Potato sticks"], ["Ice Cream", "Cold treat"]
    ]
  },
  "everyday": {
    "words": [
      ["Toothbrush", "Bristled cleaner"], ["Toothpaste", "Minty paste"], ["Floss", "String cleaner"], ["Mouthwash", "Liquid rinse"], ["Soap", "Lathering bar"],
      ["Shampoo", "Hair soap"], ["Conditioner", "Hair softener"], ["Towel", "Drying cloth"], ["Washcloth", "Small scrubber"], ["Sponge", "Absorbent pad"],
      ["Razor", "Shaving blade"], ["Shaving Cream", "Foaming foam"], ["Deodorant", "Sweat stopper"], ["Perfume", "Sweet scent"], ["Cologne", "Men scent"],
      ["Lotion", "Skin moisturizer"], ["Sunscreen", "Burn protector"], ["Comb", "Hair detangler"], ["Brush", "Hair smoother"], ["Hair Dryer", "Blowing heater"],
      ["Mirror", "Reflective glass"], ["Toilet", "Bathroom fixture"], ["Toilet Paper", "Wiping roll"], ["Plunger", "Clog clearer"], ["Shower", "Spraying bath"],
      ["Bathtub", "Soaking tub"], ["Sink", "Washing basin"], ["Faucet", "Water spout"], ["Drain", "Water exit"], ["Trash Can", "Garbage bin"],
      ["Garbage Bag", "Plastic liner"], ["Broom", "Floor sweeper"], ["Dustpan", "Dirt scoop"], ["Mop", "Floor washer"], ["Bucket", "Water pail"],
      ["Vacuum", "Suction cleaner"], ["Duster", "Feather cleaner"], ["Iron", "Wrinkle presser"], ["Ironing Board", "Pressing table"], ["Washing Machine", "Clothes cleaner"],
      ["Dryer", "Clothes heater"], ["Laundry Basket", "Clothes hamper"], ["Detergent", "Washing soap"], ["Fabric Softener", "Static reducer"], ["Bleach", "Whitening liquid"],
      ["Dishwasher", "Plate cleaner"], ["Dish Soap", "Plate bubble"], ["Sponge", "Washing pad"], ["Dish Towel", "Plate drier"], ["Oven", "Baking appliance"],
      ["Stove", "Cooking appliance"], ["Microwave", "Quick heater"], ["Toaster", "Bread browner"], ["Blender", "Mixing machine"], ["Coffee Maker", "Brewing machine"],
      ["Refrigerator", "Cold storage"], ["Freezer", "Ice storage"], ["Pantry", "Food closet"], ["Cabinet", "Storage cupboard"], ["Drawer", "Sliding storage"],
      ["Table", "Eating surface"], ["Chair", "Sitting furniture"], ["Stool", "Tall seat"], ["Sofa", "Couch seating"], ["Armchair", "Comfy seat"],
      ["Coffee Table", "Low surface"], ["End Table", "Side surface"], ["Lamp", "Light source"], ["Lightbulb", "Glowing glass"], ["Switch", "Power flipper"],
      ["Outlet", "Power plug"], ["Extension Cord", "Power lengthener"], ["Television", "Screen watcher"], ["Remote", "Channel changer"], ["Speaker", "Sound maker"],
      ["Headphones", "Ear speakers"], ["Computer", "Digital machine"], ["Keyboard", "Typing board"], ["Mouse", "Clicking pointer"], ["Monitor", "Display screen"],
      ["Printer", "Paper maker"], ["Phone", "Calling device"], ["Charger", "Power provider"], ["Battery", "Power cell"], ["Clock", "Time teller"],
      ["Watch", "Wrist time"], ["Calendar", "Date tracker"], ["Pen", "Ink writer"], ["Pencil", "Lead writer"], ["Eraser", "Mistake remover"],
      ["Paper", "Writing sheet"], ["Notebook", "Bound pages"], ["Folder", "Paper holder"], ["Binder", "Ringed folder"], ["Stapler", "Paper fastener"],
      ["Paperclip", "Wire fastener"], ["Tape", "Sticky roll"], ["Scissors", "Cutting tool"], ["Glue", "Sticky liquid"], ["Ruler", "Measuring stick"],
      ["Bed", "Sleeping furniture"], ["Mattress", "Sleeping pad"], ["Pillow", "Head cushion"], ["Blanket", "Warm cover"], ["Sheet", "Bed cloth"],
      ["Closet", "Clothes storage"], ["Hanger", "Clothes hook"], ["Dresser", "Clothes drawers"], ["Mirror", "Reflective glass"], ["Rug", "Floor cover"]
    ]
  },
  "f1": {
    "words": [
      ["Car", "Racing machine"], ["Driver", "Wheel person"], ["Helmet", "Head protector"], ["Suit", "Fireproof clothing"], ["Gloves", "Hand wear"],
      ["Boots", "Foot wear"], ["Balaclava", "Face mask"], ["Steering Wheel", "Turning circle"], ["Pedal", "Foot control"], ["Brake", "Stopping power"],
      ["Throttle", "Going power"], ["Clutch", "Gear engager"], ["Gearbox", "Transmission box"], ["Engine", "Power plant"], ["Motor", "Electric power"],
      ["Battery", "Energy store"], ["Exhaust", "Tail pipe"], ["Turbocharger", "Air compressor"], ["Radiator", "Cooling fin"], ["Suspension", "Shock absorber"],
      ["Tire", "Rubber wheel"], ["Wheel", "Metal rim"], ["Wing", "Aero part"], ["Spoiler", "Rear aero"], ["Diffuser", "Under floor"],
      ["Chassis", "Main frame"], ["Monocoque", "Safety cell"], ["Halo", "Head guard"], ["Mirror", "Rear view"], ["Antenna", "Radio stick"],
      ["Camera", "Video eye"], ["Sensor", "Data gatherer"], ["Telemetry", "Data stream"], ["Radio", "Voice comms"], ["Pit Stop", "Service halt"],
      ["Mechanic", "Wrench turner"], ["Engineer", "Data brain"], ["Team Principal", "Boss person"], ["Strategist", "Plan maker"], ["Pit Wall", "Command post"],
      ["Garage", "Car home"], ["Paddock", "Team area"], ["Motorhome", "Hospitality unit"], ["Track", "Racing circuit"], ["Circuit", "Racing loop"],
      ["Straight", "Long stretch"], ["Corner", "Turn curve"], ["Hairpin", "Tight turn"], ["Chicane", "S turn"], ["Apex", "Inner point"],
      ["Curb", "Edge bump"], ["Rumble Strip", "Vibrating edge"], ["Gravel Trap", "Stone bed"], ["Runoff", "Escape area"], ["Barrier", "Wall crash"],
      ["Grandstand", "Fan seating"], ["Start Line", "Beginning mark"], ["Finish Line", "Ending mark"], ["Grid", "Starting spots"], ["Pole Position", "First spot"],
      ["Qualifying", "Speed test"], ["Practice", "Learning session"], ["Race", "Main event"], ["Sprint", "Short race"], ["Lap", "One circuit"],
      ["Sector", "Track part"], ["Time", "Clock tick"], ["Gap", "Distance between"], ["Interval", "Time between"], ["Overtake", "Passing move"],
      ["Slipstream", "Drafting behind"], ["DRS", "Flap open"], ["Downforce", "Pushing down"], ["Drag", "Air resistance"], ["G-Force", "Corner pressure"],
      ["Understeer", "Pushing wide"], ["Oversteer", "Sliding rear"], ["Lockup", "Tire slide"], ["Spin", "Rotating out"], ["Crash", "Hitting wall"],
      ["Damage", "Broken part"], ["Puncture", "Flat tire"], ["Blistering", "Tire bubble"], ["Graining", "Tire crumble"], ["Degradation", "Tire wear"],
      ["Compound", "Rubber type"], ["Soft", "Fast rubber"], ["Medium", "Middle rubber"], ["Hard", "Slow rubber"], ["Intermediate", "Wet rubber"],
      ["Wet", "Rain rubber"], ["Blanket", "Tire warmer"], ["Jack", "Car lifter"], ["Wheel Gun", "Nut remover"], ["Fuel", "Gas liquid"],
      ["Oil", "Lube liquid"], ["Flag", "Waving signal"], ["Green Flag", "Go signal"], ["Yellow Flag", "Caution signal"], ["Red Flag", "Stop signal"],
      ["Blue Flag", "Pass signal"], ["Black Flag", "DQ signal"], ["Checkered Flag", "End signal"], ["Safety Car", "Pace vehicle"], ["Virtual Safety Car", "Pace speed"],
      ["Penalty", "Rule break"], ["Stop and Go", "Halt wait"], ["Drive Through", "Pit lane pass"], ["Time Penalty", "Added seconds"], ["Grid Penalty", "Spot drop"],
      ["Points", "Score tally"], ["Championship", "Title fight"], ["Trophy", "Winner cup"], ["Podium", "Top three steps"], ["Champagne", "Bubbly spray"]
    ]
  },
  "fashion": {
    "words": [
      ["Shirt", "Top garment"], ["T-Shirt", "Casual top"], ["Blouse", "Dressy top"], ["Sweater", "Knit top"], ["Cardigan", "Button knit"],
      ["Hoodie", "Head cover top"], ["Jacket", "Light coat"], ["Coat", "Heavy outerwear"], ["Parka", "Winter outerwear"], ["Trench Coat", "Rain outerwear"],
      ["Vest", "Sleeveless layer"], ["Suit", "Formal set"], ["Blazer", "Formal jacket"], ["Tuxedo", "Fancy suit"], ["Dress", "One piece"],
      ["Gown", "Fancy dress"], ["Skirt", "Bottom half"], ["Pants", "Leg covers"], ["Jeans", "Denim leg covers"], ["Trousers", "Formal leg covers"],
      ["Shorts", "Short leg covers"], ["Leggings", "Tight leg covers"], ["Sweatpants", "Cozy leg covers"], ["Overalls", "Bib pants"], ["Jumpsuit", "One piece pants"],
      ["Romper", "Short one piece"], ["Swimsuit", "Water wear"], ["Bikini", "Two piece water"], ["Trunks", "Water shorts"], ["Underwear", "Base layer"],
      ["Bra", "Chest support"], ["Panties", "Bottom base layer"], ["Boxers", "Loose base layer"], ["Briefs", "Tight base layer"], ["Socks", "Foot covers"],
      ["Tights", "Leg sheers"], ["Pantyhose", "Waist sheers"], ["Shoes", "Footwear"], ["Sneakers", "Athletic footwear"], ["Boots", "Tall footwear"],
      ["Heels", "Tall shoes"], ["Flats", "Low shoes"], ["Sandals", "Open shoes"], ["Slippers", "Cozy shoes"], ["Loafers", "Slip on shoes"],
      ["Oxfords", "Lace up shoes"], ["Wedges", "Thick heel shoes"], ["Platforms", "Thick sole shoes"], ["Mules", "Backless shoes"], ["Clogs", "Wood shoes"],
      ["Hat", "Head cover"], ["Cap", "Brimmed head cover"], ["Beanie", "Knit head cover"], ["Fedora", "Brimmed felt"], ["Sun Hat", "Wide brim"],
      ["Visor", "Brim only"], ["Headband", "Hair holder"], ["Scarf", "Neck wrap"], ["Tie", "Neck knot"], ["Bowtie", "Neck bow"],
      ["Belt", "Waist cincher"], ["Suspenders", "Shoulder straps"], ["Gloves", "Hand covers"], ["Mittens", "Thumb covers"], ["Sunglasses", "Eye shades"],
      ["Glasses", "Eye sight"], ["Watch", "Wrist time"], ["Bracelet", "Wrist jewelry"], ["Necklace", "Neck jewelry"], ["Earrings", "Ear jewelry"],
      ["Ring", "Finger jewelry"], ["Brooch", "Pin jewelry"], ["Cufflinks", "Sleeve fasteners"], ["Purse", "Bag holder"], ["Handbag", "Arm bag"],
      ["Clutch", "Hand bag"], ["Backpack", "Back bag"], ["Tote", "Shoulder bag"], ["Wallet", "Money holder"], ["Umbrella", "Rain shield"],
      ["Zipper", "Toothed fastener"], ["Button", "Round fastener"], ["Snap", "Press fastener"], ["Velcro", "Hook loop"], ["Lace", "String tie"],
      ["Buckle", "Strap fastener"], ["Collar", "Neck trim"], ["Cuff", "Sleeve end"], ["Pocket", "Small pouch"], ["Seam", "Stitch line"],
      ["Hem", "Bottom edge"], ["Pleat", "Folded fabric"], ["Ruffle", "Gathered fabric"], ["Fringe", "Hanging threads"], ["Tassel", "Thread bunch"],
      ["Embroidery", "Stitched art"], ["Applique", "Sewn patch"], ["Sequins", "Shiny discs"], ["Beads", "Small spheres"], ["Rhinestones", "Fake gems"],
      ["Fabric", "Cloth material"], ["Cotton", "Plant cloth"], ["Wool", "Animal cloth"], ["Silk", "Worm cloth"], ["Linen", "Flax cloth"],
      ["Denim", "Blue cloth"], ["Leather", "Skin cloth"], ["Suede", "Soft skin"], ["Velvet", "Fuzzy cloth"], ["Lace", "Open cloth"],
      ["Chiffon", "Sheer cloth"], ["Satin", "Smooth cloth"], ["Polyester", "Plastic cloth"], ["Nylon", "Strong plastic cloth"], ["Spandex", "Stretchy cloth"]
    ]
  },
  "food": {
    "words": [
      ["Apple", "Red fruit"], ["Banana", "Yellow peel"], ["Orange", "Citrus fruit"], ["Grape", "Vine fruit"], ["Strawberry", "Red berry"],
      ["Blueberry", "Blue berry"], ["Raspberry", "Bumpy berry"], ["Blackberry", "Dark berry"], ["Watermelon", "Green melon"], ["Cantaloupe", "Orange melon"],
      ["Honeydew", "Light melon"], ["Peach", "Fuzzy fruit"], ["Plum", "Purple fruit"], ["Cherry", "Pit fruit"], ["Pear", "Bell fruit"],
      ["Pineapple", "Spiky fruit"], ["Mango", "Tropical fruit"], ["Papaya", "Orange tropical"], ["Kiwi", "Fuzzy green"], ["Pomegranate", "Seed fruit"],
      ["Lemon", "Sour yellow"], ["Lime", "Sour green"], ["Grapefruit", "Bitter citrus"], ["Tomato", "Red vegetable"], ["Potato", "Brown spud"],
      ["Carrot", "Orange root"], ["Onion", "Crying root"], ["Garlic", "Pungent bulb"], ["Broccoli", "Green tree"], ["Cauliflower", "White tree"],
      ["Spinach", "Leafy green"], ["Lettuce", "Salad green"], ["Cabbage", "Round green"], ["Celery", "Crunchy stalk"], ["Cucumber", "Long green"],
      ["Zucchini", "Green squash"], ["Squash", "Yellow gourd"], ["Pumpkin", "Orange gourd"], ["Pepper", "Spicy pod"], ["Corn", "Yellow kernel"],
      ["Pea", "Green pod"], ["Bean", "Legume seed"], ["Lentil", "Small legume"], ["Chickpea", "Garbanzo bean"], ["Soybean", "Edamame bean"],
      ["Mushroom", "Fungi cap"], ["Bread", "Baked dough"], ["Bagel", "Holey dough"], ["Croissant", "Flaky pastry"], ["Muffin", "Baked cup"],
      ["Cake", "Sweet bake"], ["Pie", "Crust bake"], ["Cookie", "Sweet disc"], ["Brownie", "Chocolate square"], ["Donut", "Fried ring"],
      ["Pasta", "Italian noodles"], ["Spaghetti", "Long noodles"], ["Macaroni", "Curved noodles"], ["Rice", "White grains"], ["Oats", "Breakfast grains"],
      ["Quinoa", "Tiny grains"], ["Cereal", "Breakfast bowl"], ["Cheese", "Dairy block"], ["Milk", "Dairy liquid"], ["Butter", "Dairy spread"],
      ["Yogurt", "Dairy spoon"], ["Ice Cream", "Dairy freeze"], ["Egg", "Shell oval"], ["Chicken", "Poultry meat"], ["Turkey", "Big bird meat"],
      ["Beef", "Cow meat"], ["Pork", "Pig meat"], ["Bacon", "Crispy strip"], ["Sausage", "Meat tube"], ["Ham", "Pink meat"],
      ["Steak", "Meat cut"], ["Fish", "Swimming meat"], ["Salmon", "Pink fish"], ["Tuna", "Canned fish"], ["Shrimp", "Curved seafood"],
      ["Crab", "Clawed seafood"], ["Lobster", "Red seafood"], ["Oyster", "Shell seafood"], ["Clam", "Bivalve seafood"], ["Squid", "Tentacle seafood"],
      ["Pizza", "Cheese slice"], ["Burger", "Meat bun"], ["Hot Dog", "Meat tube bun"], ["Sandwich", "Bread layers"], ["Taco", "Folded shell"],
      ["Burrito", "Wrapped flour"], ["Sushi", "Raw fish"], ["Soup", "Liquid bowl"], ["Stew", "Thick bowl"], ["Chili", "Spicy bowl"],
      ["Salad", "Green bowl"], ["Fries", "Potato sticks"], ["Chips", "Crispy slices"], ["Pretzel", "Twisted dough"], ["Popcorn", "Popped kernel"],
      ["Chocolate", "Cocoa bar"], ["Candy", "Sugar treat"], ["Gum", "Chewing treat"], ["Honey", "Bee sweet"], ["Sugar", "Sweet grains"],
      ["Salt", "Salty grains"], ["Pepper", "Spicy grains"], ["Water", "Clear liquid"], ["Juice", "Fruit liquid"], ["Soda", "Bubbly liquid"],
      ["Coffee", "Bean liquid"], ["Tea", "Leaf liquid"], ["Wine", "Grape alcohol"], ["Beer", "Grain alcohol"], ["Liquor", "Strong alcohol"]
    ]
  }
}

import re

for cat, data in categories.items():
    json_name = re.sub(r'([A-Z])', r'-\1', cat).lower()
    ts_content = f"""import {{ Pack }} from '../types';

export const {cat}: Pack = {{
  id: '{json_name}',
  name: '{cat.replace('campusLife', 'Campus Life').replace('f1', 'Formula 1').capitalize()}',
  description: '120 words for {cat}',
  categories: ['{cat}'],
  words: [
"""
    for w in data["words"]:
        ts_content += f"    {{ word: '{w[0]}', hint: '{w[1]}' }},\n"
    ts_content += "  ]\n};\n"
    
    json_obj = {
        "id": json_name,
        "name": cat.replace('campusLife', 'Campus Life').replace('f1', 'Formula 1').capitalize(),
        "description": f"120 words for {cat}",
        "categories": [cat],
        "words": [{"word": w[0], "hint": w[1]} for w in data["words"]]
    }
    
    with open(f"c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/packs/{cat}.ts", "w") as f:
        f.write(ts_content)
    with open(f"c:/Users/sam/Documents/Projects/wordmask/packages/core/src/packs/data/{json_name}.json", "w") as f:
        f.write(json.dumps(json_obj, indent=2))

print("Done")
