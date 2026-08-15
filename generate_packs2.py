import json
import os
import subprocess

def powershell_set_content(path, content):
    content_safe = content.replace("'", "''")
    cmd = f"$content = @'\n{content_safe}\n'@\nSet-Content -Path '{path}' -Value $content -Encoding UTF8"
    with open('temp.ps1', 'w', encoding='utf-8') as f:
        f.write(cmd)
    subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", "temp.ps1"])

packs = [
    {
        "id": "animals",
        "name": "Animals",
        "emoji": "🦁",
        "desc": "Creatures from around the world.",
        "var": "ANIMALS_PACK",
        "data": "Dog:Bark,Pet,Loyal|Cat:Meow,Feline,Purr|Lion:King,Mane,Roar|Tiger:Stripes,Fierce,Jungle|Bear:Grizzly,Honey,Claws|Elephant:Trunk,Tusks,Grey|Giraffe:Neck,Tall,Spots|Zebra:Stripes,Horse,Africa|Monkey:Swing,Banana,Chimp|Gorilla:Ape,Chest,Silverback|Kangaroo:Jump,Pouch,Joey|Penguin:Tuxedo,Ice,Waddle|Dolphin:Flipper,Ocean,Smart|Whale:Huge,Blowhole,Sea|Shark:Fins,Teeth,Jaws|Octopus:Tentacles,Ink,Eight|Snake:Slither,Hiss,Venom|Turtle:Shell,Slow,Reptile|Frog:Leap,Croak,Pond|Lizard:Scales,Tail,Crawl|Cheetah:Fast,Spots,Sprint|Leopard:Spotted,Tree,Cat|Panther:Black,Stealth,Feline|Jaguar:Amazon,Spots,Predator|Wolf:Howl,Pack,Moon|Fox:Sly,Red,Bushy|Coyote:Desert,Howl,Wild|Hyena:Laugh,Scavenger,Pack|Rhino:Horn,Charge,Heavy|Hippo:River,Yawn,Heavy|Crocodile:Snout,Teeth,Swamp|Alligator:Florida,Swamp,Reptile|Deer:Antlers,Bambi,Forest|Moose:Huge,Antlers,North|Elk:Bugle,Antlers,Wild|Caribou:Snow,Herd,Tundra|Reindeer:Sleigh,Santa,Hooves|Antelope:Fast,Horns,Plains|Gazelle:Leap,Fast,Prey|Buffalo:Plains,Horns,Herd|Bison:Hump,Prairie,Heavy|Cow:Moo,Milk,Farm|Bull:Horns,Rodeo,Charge|Sheep:Baa,Wool,Flock|Goat:Horns,Beard,Climb|Pig:Oink,Mud,Pork|Horse:Neigh,Gallop,Ride|Donkey:Bray,Mule,Burro|Camel:Hump,Desert,Spit|Llama:Andes,Spit,Fleece|Alpaca:Wool,Andes,Soft|Rabbit:Hop,Carrot,Ears|Hare:Fast,Ears,Wild|Squirrel:Acorn,Bushy,Tree|Chipmunk:Cheeks,Stripes,Small|Mouse:Squeak,Cheese,Tiny|Rat:Sewer,Tail,Rodent|Hamster:Wheel,Pet,Cheeks|Guinea Pig:Squeak,Pet,Cavy|Porcupine:Quills,Spikes,Defense|Hedgehog:Spikes,Curl,Sonic|Skunk:Spray,Stink,Stripe|Raccoon:Mask,Trash,Paws|Badger:Fierce,Claws,Burrow|Beaver:Dam,Wood,Tail|Otter:River,Playful,Shell|Seal:Bark,Flippers,Ocean|Walrus:Tusks,Mustache,Ice|Sea Lion:Bark,Perform,Flippers|Manatee:Sea cow,Slow,Gentle|Dugong:Ocean,Herbivore,Gentle|Sloth:Slow,Tree,Sleep|Armadillo:Shell,Roll,Armor|Anteater:Snout,Tongue,Insects|Platypus:Duckbill,Poison,Weird|Echidna:Spines,Egg,Monotreme|Koala:Eucalyptus,Bear,Pouch|Wombat:Burrow,Cube,Marsupial|Tasmanian Devil:Spin,Fierce,Island|Opossum:Play dead,Marsupial,Night|Bat:Fly,Sonar,Night|Owl:Hoot,Night,Wise|Eagle:Bald,Soar,Bird|Hawk:Predator,Talons,Sky|Falcon:Dive,Fast,Bird|Osprey:Fish,Dive,Bird|Vulture:Scavenger,Bald,Circle|Condor:Huge,Andes,Scavenger|Crow:Black,Caw,Smart|Raven:Black,Nevermore,Smart|Magpie:Shiny,Thief,Bird|Blue Jay:Blue,Noisy,Bird|Cardinal:Red,Crest,Bird|Robin:Redbreast,Spring,Worm|Sparrow:Small,Chirp,Common|Finch:Small,Beak,Seed|Pigeon:City,Coo,Flock|Dove:Peace,White,Bird|Swan:Graceful,White,Pond|Goose:Honk,V,Fly|Duck:Quack,Pond,Webbed|Pelican:Pouch,Fish,Beak|Seagull:Beach,Chip,Loud|Albatross:Wingspan,Ocean,Bird|Ostrich:Run,Huge,Flightless|Emu:Australia,Run,Bird|Kiwi:New Zealand,Fruit,Flightless|Peacock:Feathers,Show,Tail|Flamingo:Pink,One leg,Flock|Parrot:Talk,Colors,Pirate|Macaw:Jungle,Loud,Colors|Cockatoo:Crest,Loud,Pet|Toucan:Bill,Colorful,Jungle|Woodpecker:Tree,Knock,Bird|Hummingbird:Hover,Nectar,Fast"
    },
    {
        "id": "campus-life",
        "name": "Campus Life",
        "emoji": "🎓",
        "desc": "College and university living.",
        "var": "CAMPUS_LIFE_PACK",
        "data": "Dorm:Sleep,Roommate,Bed|Library:Books,Quiet,Study|Lecture:Listen,Notes,Hall|Exam:Test,Pass,Fail|Thesis:Paper,Final,Research|Professor:Teach,Smart,Class|Student:Learn,Study,College|Campus:Grounds,Walk,Buildings|Degree:Graduate,Paper,Diploma|Syllabus:Outline,Course,Plan|Grade:Score,Pass,Fail|Assignment:Homework,Task,Due|Quiz:Short,Test,Surprise|Essay:Write,Words,Paper|Project:Group,Work,Final|Semester:Term,Half,Year|Scholarship:Money,Free,Award|Tuition:Pay,Cost,Money|Textbook:Read,Heavy,Costly|Notebook:Write,Paper,Spiral|Backpack:Carry,Books,Bag|Cafeteria:Food,Eat,Tray|Dining Hall:Meal,Plan,Eat|Quad:Grass,Sit,Frisbee|Fraternity:Greek,Brothers,House|Sorority:Greek,Sisters,House|Alumni:Grad,Past,School|Dean:Head,Boss,College|Advisor:Help,Plan,Guide|Major:Focus,Subject,Degree|Minor:Secondary,Subject,Study|Credits:Points,Pass,Class|Elective:Choice,Fun,Class|Prerequisite:Before,Require,Class|Transcript:Record,Grades,Paper|GPA:Average,Score,Number|Midterm:Halfway,Test,Exam|Final:Last,Test,Exam|Commencement:Grad,Ceremony,Walk|Tassel:Hat,Turn,Grad|Cap:Head,Grad,Gown|Gown:Wear,Grad,Robe|Diploma:Paper,Degree,Frame|Valedictorian:Top,Speech,Smart|Salutatorian:Second,Speech,Smart|Plagiarism:Copy,Cheat,Steal|Citation:Source,Reference,Quote|Bibliography:List,Sources,End|Abstract:Summary,Start,Paper|Lab:Science,Coat,Experiment|Equipment:Tools,Use,Lab|Beaker:Glass,Pour,Lab|Microscope:Look,Small,Science|Telescope:Look,Stars,Space|Easel:Art,Paint,Stand|Canvas:Paint,Blank,Art|Studio:Room,Art,Work|Rehearsal:Practice,Play,Music|Audition:Try,Part,Play|Stage:Act,Play,Theater|Auditorium:Seats,Show,Hall|Gymnasium:Sports,Play,Court|Stadium:Seats,Field,Game|Bleachers:Sit,Watch,Cheer|Mascot:Costume,Cheer,Team|Cheerleader:Pom,Yell,Team|Coach:Lead,Team,Yell|Referee:Whistle,Rule,Game|Whistle:Blow,Stop,Ref|Trophy:Win,Cup,Award|Medal:Neck,Win,Gold|Certificate:Paper,Award,Print|Whiteboard:Marker,Write,Erase|Chalkboard:Dust,Write,Erase|Marker:Draw,Color,Whiteboard|Eraser:Remove,Mistake,Clean|Projector:Screen,Show,Light|Screen:Watch,Show,Projector|Podium:Stand,Speak,Speech|Microphone:Speak,Loud,Stand|Desk:Sit,Work,Table|Chair:Sit,Seat,Rest|Locker:Store,Code,Metal|Keycard:Swipe,Door,Access|ID:Card,Face,Show|Lanyard:Neck,Hold,ID|Bulletin Board:Pins,Flyers,Wall|Flyer:Paper,Ad,Wall|Poster:Wall,Big,Art|Club:Group,Meet,Fun|Society:Group,Join,Meet|Meeting:Gather,Talk,Group|Agenda:Plan,List,Meeting|Minutes:Notes,Time,Meeting|Debate:Argue,Talk,Side|Election:Vote,Choose,Win|Campaign:Run,Vote,Signs|Candidate:Run,Person,Vote|Ballot:Vote,Paper,Box|President:Head,Lead,Top|Vice President:Second,Lead,Next|Treasurer:Money,Keep,Lead|Secretary:Notes,Keep,Lead|Committee:Group,Task,Work|Volunteer:Help,Free,Time|Internship:Work,Learn,Free|Resume:Paper,Job,Skills|Interview:Talk,Job,Questions|Career Fair:Jobs,Booths,Meet|Networking:Meet,Talk,Jobs|Business Card:Name,Paper,Hand|Portfolio:Work,Show,Art|Recommendation:Letter,Praise,Help|Reference:Person,Call,Vouch|Application:Form,Fill,Apply|Deadline:Time,Due,Late|Extension:More,Time,Late|Late:Tardy,Miss,Time|Absence:Miss,Gone,Class"
    },
    {
        "id": "everyday",
        "name": "Everyday",
        "emoji": "📱",
        "desc": "Common items and daily routines.",
        "var": "EVERYDAY_PACK",
        "data": "Phone:Call,Text,Screen|Keys:Unlock,Door,Metal|Wallet:Money,Cards,Leather|Watch:Time,Wrist,Tick|Glasses:See,Eyes,Frames|Shoes:Walk,Feet,Laces|Socks:Feet,Warm,Cotton|Shirt:Wear,Top,Sleeves|Pants:Legs,Wear,Jeans|Jacket:Warm,Coat,Zip|Toothbrush:Clean,Teeth,Paste|Soap:Wash,Lather,Clean|Shampoo:Hair,Wash,Suds|Towel:Dry,Bath,Cloth|Mirror:Look,Reflect,Glass|Bed:Sleep,Mattress,Rest|Pillow:Head,Soft,Sleep|Blanket:Warm,Cover,Bed|Alarm:Wake,Ring,Clock|Clock:Time,Tick,Wall|Door:Open,Close,Wood|Window:Glass,Look,Open|Curtain:Drape,Window,Pull|Rug:Floor,Carpet,Step|Chair:Sit,Seat,Rest|Table:Eat,Wood,Legs|Couch:Sit,Living,Soft|Television:Watch,Screen,Show|Remote:Click,Channel,Control|Lamp:Light,Switch,Shade|Bulb:Light,Screw,Bright|Candle:Wax,Flame,Burn|Match:Strike,Fire,Wood|Lighter:Flick,Flame,Fire|Stove:Cook,Heat,Burner|Oven:Bake,Heat,Food|Microwave:Heat,Fast,Beep|Refrigerator:Cold,Food,Keep|Freezer:Ice,Cold,Keep|Sink:Wash,Water,Tap|Faucet:Turn,Water,Tap|Toilet:Flush,Seat,Bowl|Shower:Wash,Water,Stand|Bathtub:Wash,Water,Sit|Sponge:Scrub,Clean,Wet|Broom:Sweep,Dirt,Floor|Dustpan:Sweep,Dirt,Hold|Mop:Wash,Floor,Wet|Bucket:Hold,Water,Pail|Trash Can:Waste,Throw,Bin|Recycling:Green,Bin,Save|Bag:Carry,Hold,Plastic|Box:Cardboard,Hold,Square|Tape:Sticky,Roll,Bind|Scissors:Cut,Paper,Sharp|Paper:Write,Sheet,White|Pen:Write,Ink,Click|Pencil:Write,Lead,Wood|Eraser:Mistake,Rub,Pink|Stapler:Bind,Paper,Metal|Paperclip:Hold,Paper,Metal|Folder:Hold,Paper,Manila|Envelope:Mail,Letter,Seal|Stamp:Mail,Letter,Sticky|Letter:Mail,Write,Paper|Mailbox:Post,Letter,Metal|Package:Box,Mail,Delivery|Newspaper:Read,Daily,Print|Magazine:Read,Glossy,Pages|Book:Read,Pages,Cover|Bookmark:Keep,Place,Page|Calendar:Date,Month,Wall|Diary:Write,Secret,Book|Journal:Write,Daily,Book|Purse:Carry,Bag,Straps|Umbrella:Rain,Keep,Dry|Raincoat:Rain,Wear,Dry|Boots:Rain,Feet,Walk|Gloves:Warm,Hands,Fingers|Scarf:Warm,Neck,Wrap|Hat:Head,Wear,Brim|Belt:Waist,Hold,Buckle|Tie:Neck,Suit,Knot|Suit:Wear,Formal,Jacket|Dress:Wear,Formal,Skirt|Skirt:Wear,Legs,Spin|Shorts:Wear,Legs,Summer|Swimsuit:Pool,Wear,Swim|Sunscreen:Lotion,Burn,Sun|Sunglasses:Eyes,Sun,Shades|Lipstick:Makeup,Red,Lips|Mascara:Makeup,Eyes,Lashes|Perfume:Smell,Spray,Scent|Deodorant:Smell,Armpit,Roll|Razor:Shave,Hair,Sharp|Shaving Cream:Lather,Face,Shave|Comb:Hair,Teeth,Part|Brush:Hair,Bristles,Stroke|Hairdryer:Blow,Hot,Hair|Iron:Press,Clothes,Hot|Ironing Board:Flat,Press,Stand|Washing Machine:Clean,Clothes,Spin|Dryer:Dry,Clothes,Hot|Laundry Basket:Hold,Clothes,Plastic|Hanger:Closet,Clothes,Hook|Closet:Store,Clothes,Doors|Drawer:Pull,Store,Wood|Shelf:Hold,Books,Wood|Picture:Frame,Wall,Photo|Painting:Art,Wall,Canvas|Vase:Flowers,Glass,Hold|Plant:Grow,Green,Pot|Pot:Dirt,Plant,Hold|Teacup:Drink,Warm,Saucer|Mug:Coffee,Handle,Hot|Plate:Eat,Round,Dish|Bowl:Soup,Deep,Dish|Fork:Eat,Tines,Metal|Spoon:Eat,Soup,Silver|Knife:Cut,Sharp,Metal"
    },
    {
        "id": "f1",
        "name": "Formula 1",
        "emoji": "🏎️",
        "desc": "Motorsport racing terms.",
        "var": "F1_PACK",
        "data": "Car:Drive,Fast,Race|Track:Asphalt,Drive,Circuit|Pitstop:Tires,Change,Fast|Driver:Steer,Race,Person|Helmet:Head,Safe,Visor|Tyre:Rubber,Wheel,Black|Engine:Power,Motor,Loud|Wing:Aero,Front,Rear|Grid:Start,Line,Cars|Flag:Wave,Checkered,Color|Apex:Corner,Hit,Turn|Paddock:Walk,VIP,Teams|Cockpit:Sit,Steer,Inside|Chassis:Body,Frame,Carbon|Downforce:Push,Aero,Grip|Slipstream:Draft,Follow,Fast|Overtake:Pass,Ahead,Move|Penalty:Rule,Time,Punish|Podium:Top,Three,Trophy|Pole:First,Start,Qualify|Qualifying:Time,Fast,Grid|Practice:Learn,Friday,Drive|Sector:Part,Track,Time|Lap:Round,Track,Time|Chicane:Turn,Left,Right|Hairpin:Turn,Tight,Slow|Straight:Fast,No,Turns|Telemetry:Data,Read,Screen|Strategy:Plan,Pit,Tires|Undercut:Pit,Early,Pass|Overcut:Pit,Late,Pass|Slick:Dry,Tire,Smooth|Intermediate:Damp,Tire,Green|Wet:Rain,Tire,Blue|Compound:Soft,Medium,Hard|Degradation:Wear,Tire,Lose|Blistering:Hot,Tire,Bubble|Graining:Wear,Tire,Crumble|Suspension:Springs,Ride,Bumps|Aero:Wind,Shape,Fast|Diffuser:Rear,Air,Floor|Halo:Head,Safe,Titanium|Visor:See,Helmet,Tear|Balaclava:Fire,Wear,Head|Overalls:Suit,Fire,Wear|Gloves:Hands,Steer,Wear|Boots:Feet,Pedals,Wear|Steering:Wheel,Buttons,Turn|Radio:Talk,Team,Hear|Engineer:Talk,Plan,Smart|Mechanic:Fix,Build,Wrench|Principal:Boss,Team,Lead|Steward:Rule,Judge,Penalize|Director:Race,Lead,Control|Marshal:Flag,Help,Track|Safety:Car,Slow,Pace|Medical:Car,Help,Doctor|Lights:Red,Out,Start|Chequered:Flag,End,Win|Yellow:Flag,Slow,Danger|Red:Flag,Stop,Danger|Blue:Flag,Pass,Lapped|Green:Flag,Go,Clear|Black:Flag,Out,Disqualify|White:Flag,Slow,Ahead|Champion:Win,Year,Title|Constructor:Team,Build,Win|Standings:Points,List,Rank|Points:Score,Ten,Win|Trophy:Cup,Win,Hold|Champagne:Spray,Drink,Podium|Anthem:Song,Country,Play|Grandstand:Sit,Watch,Fans|Spectator:Watch,Fan,See|Merchandise:Shirt,Cap,Buy|Sponsorship:Money,Logo,Brand|Livery:Colors,Paint,Design|Decal:Sticker,Logo,Car|Carbon:Fiber,Black,Light|Kevlar:Strong,Yellow,Material|Titanium:Metal,Sparks,Skid|Alloy:Metal,Wheel,Mix|Rubber:Tire,Black,Grip|Brakes:Stop,Hot,Disc|Disc:Brake,Round,Stop|Caliper:Brake,Squeeze,Pad|Pad:Brake,Friction,Stop|Fluid:Brake,Liquid,Line|Sensor:Data,Read,Part|Cable:Wire,Connect,Part|Wiring:Loom,Electrical,Car|Battery:Power,Hybrid,Store|Motor:Electric,Power,Drive|Generator:Power,Make,Spin|Exhaust:Pipe,Gas,Hot|Turbo:Spin,Power,Boost|Intake:Air,Breathe,Engine|Radiator:Cool,Water,Side|Cooler:Cold,Air,Part|Pump:Move,Fluid,Part|Valve:Open,Close,Engine|Piston:Up,Down,Engine|Crankshaft:Spin,Engine,Part|Gearbox:Shift,Ratio,Part|Ratio:Gear,Speed,Number|Clutch:Start,Bite,Paddle|Shift:Gear,Up,Down|Paddle:Steer,Pull,Shift|Axle:Spin,Wheel,Part|Hub:Wheel,Attach,Part|Bearing:Spin,Smooth,Part|Nut:Wheel,Tight,Gun|Gun:Wheel,Pit,Loud|Jack:Lift,Car,Up|Trolley:Move,Tires,Push|Blanket:Heat,Tire,Warm|Garage:Box,Team,Work|Motorhome:Sleep,Eat,Team|Hospitality:VIP,Food,Drink|Pass:Lanyard,VIP,Entry|Lanyard:Neck,Pass,Wear|Turnstile:Enter,Gate,Spin"
    },
    {
        "id": "fashion",
        "name": "Fashion",
        "emoji": "👗",
        "desc": "Clothing, style, and trends.",
        "var": "FASHION_PACK",
        "data": "Vogue:Magazine,Style,Trend|Runway:Walk,Model,Show|Model:Pose,Walk,Wear|Couture:High,Custom,Sew|Denim:Jeans,Blue,Fabric|Velvet:Soft,Plush,Fabric|Silk:Smooth,Shiny,Worm|Cotton:Soft,Plant,Shirt|Leather:Cow,Jacket,Boots|Suede:Soft,Leather,Shoes|Boots:Tall,Shoes,Winter|Heels:Tall,Shoes,Women|Sneakers:Laces,Run,Casual|Sandals:Toes,Summer,Shoes|Scarf:Neck,Warm,Wrap|Hat:Head,Brim,Wear|Gloves:Hands,Warm,Fingers|Belt:Waist,Buckle,Hold|Tie:Neck,Suit,Knot|Suit:Jacket,Pants,Formal|Dress:Skirt,Women,Formal|Skirt:Legs,Women,Wear|Blouse:Shirt,Women,Wear|Sweater:Knit,Warm,Wear|Cardigan:Button,Sweater,Wear|Coat:Outer,Warm,Winter|Jacket:Outer,Zip,Wear|Blazer:Jacket,Formal,Suit|Vest:Sleeveless,Suit,Wear|Tuxedo:Formal,Black,Suit|Gown:Long,Dress,Ball|Corset:Lace,Tight,Waist|Lingerie:Under,Lace,Women|Underwear:Briefs,Wear,Bottom|Bra:Support,Wear,Women|Socks:Feet,Wear,Shoes|Tights:Legs,Nylon,Wear|Leggings:Tight,Pants,Stretch|Jeans:Blue,Denim,Pants|Trousers:Pants,Formal,Wear|Shorts:Legs,Summer,Wear|Swimsuit:Pool,Beach,Wear|Bikini:Two,Piece,Swim|Trunks:Swim,Men,Shorts|Pajamas:Sleep,Bed,Wear|Robe:Bath,Tie,Wear|Slippers:Feet,House,Soft|Jewelry:Gold,Silver,Wear|Necklace:Neck,Chain,Pendant|Bracelet:Wrist,Chain,Wear|Ring:Finger,Band,Gold|Earrings:Ears,Studs,Hoops|Watch:Wrist,Time,Tick|Brooch:Pin,Jacket,Wear|Cufflinks:Shirt,Wrist,Formal|Sunglasses:Eyes,Shades,Sun|Glasses:See,Frames,Eyes|Purse:Bag,Carry,Women|Handbag:Bag,Carry,Leather|Clutch:Small,Bag,Hold|Backpack:Straps,Carry,Bag|Briefcase:Work,Bag,Handle|Wallet:Cash,Cards,Pocket|Umbrella:Rain,Hold,Dry|Makeup:Face,Beauty,Paint|Lipstick:Lips,Color,Tube|Mascara:Lashes,Black,Wand|Eyeshadow:Lids,Color,Powder|Blush:Cheeks,Pink,Powder|Foundation:Face,Base,Liquid|Concealer:Hide,Spots,Face|Powder:Face,Set,Dust|Perfume:Scent,Spray,Women|Cologne:Scent,Spray,Men|Manicure:Nails,Polish,Hands|Pedicure:Nails,Polish,Feet|Haircut:Scissors,Trim,Style|Dye:Color,Hair,Change|Wig:Fake,Hair,Wear|Extensions:Long,Hair,Clip|Braid:Weave,Hair,Plait|Ponytail:Tie,Hair,Back|Bun:Up,Hair,Round|Barrette:Clip,Hair,Hold|Headband:Hair,Push,Band|Scrunchie:Tie,Hair,Fabric|Fabric:Material,Sew,Cloth|Thread:Sew,Needle,Spool|Needle:Sew,Sharp,Eye|Pins:Hold,Fabric,Sharp|Scissors:Cut,Fabric,Shears|Thimble:Finger,Protect,Sew|Mannequin:Dummy,Wear,Pose|Pattern:Paper,Guide,Sew|Stitch:Sew,Loop,Thread|Hem:Bottom,Fold,Sew|Seam:Join,Fabric,Line|Zipper:Teeth,Pull,Close|Button:Hole,Sew,Round|Snap:Press,Close,Metal|Hook:Eye,Close,Metal|Velcro:Rip,Sticky,Fasten|Lace:Net,Pattern,Fabric|Embroidery:Stitch,Design,Art|Beads:Small,Hole,Sew|Sequins:Shiny,Flat,Sew|Applique:Patch,Sew,Design|Drape:Hang,Fabric,Style|Pleat:Fold,Skirt,Fabric|Ruffle:Gather,Fabric,Frill|Fringe:Hang,Strings,Edge|Tassel:Hang,Strings,Knot|Trim:Edge,Decorate,Sew|Collar:Neck,Shirt,Fold|Cuff:Wrist,Shirt,Fold|Lapel:Jacket,Fold,Front|Pocket:Hold,Things,Sew|Sleeve:Arm,Shirt,Wear|Hemline:Bottom,Skirt,Length|Silhouette:Shape,Outline,Style|Trend:Fad,Now,Popular|Vintage:Old,Style,Retro"
    },
    {
        "id": "food",
        "name": "Food",
        "emoji": "🍔",
        "desc": "Delicious meals and ingredients.",
        "var": "FOOD_PACK",
        "data": "Pizza:Slice,Cheese,Crust|Burger:Bun,Patty,Beef|Sushi:Rice,Fish,Roll|Pasta:Noodles,Sauce,Italy|Salad:Lettuce,Bowl,Healthy|Taco:Shell,Meat,Mexico|Steak:Beef,Grill,Meat|Chicken:Bird,Roast,Meat|Fish:Swim,Ocean,Meat|Pork:Pig,Meat,Chop|Beef:Cow,Meat,Red|Rice:Grain,White,Bowl|Noodle:Long,Soup,Slurp|Bread:Loaf,Slice,Bake|Cheese:Yellow,Melt,Dairy|Butter:Yellow,Spread,Dairy|Milk:White,Drink,Cow|Egg:Shell,Yolk,Breakfast|Apple:Red,Fruit,Crunch|Banana:Yellow,Peel,Monkey|Orange:Citrus,Juice,Peel|Grape:Vine,Purple,Wine|Strawberry:Red,Seed,Sweet|Blueberry:Small,Blue,Muffin|Raspberry:Red,Soft,Berry|Blackberry:Black,Bramble,Berry|Melon:Large,Sweet,Fruit|Watermelon:Green,Red,Seeds|Pineapple:Spikes,Yellow,Hawaii|Mango:Tropical,Pit,Orange|Papaya:Tropical,Seeds,Orange|Peach:Fuzz,Pit,Sweet|Plum:Purple,Pit,Sweet|Cherry:Red,Pit,Stem|Pear:Green,Shape,Fruit|Lemon:Yellow,Sour,Citrus|Lime:Green,Sour,Citrus|Coconut:Hairy,Shell,Milk|Avocado:Green,Pit,Toast|Tomato:Red,Vine,Ketchup|Potato:Brown,Mash,Fry|Onion:Cry,Layers,Peel|Garlic:Clove,Vampire,Smell|Carrot:Orange,Bugs,Root|Broccoli:Green,Tree,Veggie|Cauliflower:White,Tree,Veggie|Spinach:Green,Leaf,Popeye|Lettuce:Green,Leaf,Salad|Cabbage:Head,Green,Slaw|Celery:Stalk,Crunch,Peanut|Cucumber:Green,Pickle,Slice|Zucchini:Green,Squash,Long|Squash:Yellow,Gourd,Bake|Pumpkin:Orange,Carve,Pie|Corn:Yellow,Cob,Pop|Pea:Green,Pod,Small|Bean:Green,Pod,Snap|Mushroom:Fungi,Cap,Cook|Pepper:Spicy,Bell,Shake|Salt:White,Shake,Sea|Sugar:Sweet,White,Bake|Flour:White,Powder,Bake|Oil:Liquid,Fry,Olive|Vinegar:Sour,Liquid,Dress|Soy:Sauce,Salty,Bean|Ketchup:Red,Tomato,Fries|Mustard:Yellow,Hotdog,Seed|Mayonnaise:White,Spread,Sandwich|Salsa:Dip,Chips,Tomato|Guacamole:Dip,Chips,Avocado|Hummus:Dip,Pita,Chickpea|Jelly:Spread,Sweet,Jar|Jam:Spread,Sweet,Fruit|Honey:Bee,Sweet,Sticky|Syrup:Maple,Pancake,Sticky|Chocolate:Brown,Sweet,Candy|Vanilla:Bean,Flavor,Ice|Caramel:Sticky,Sweet,Brown|Candy:Sweet,Treat,Wrapper|Cookie:Bake,Chip,Sweet|Cake:Bake,Slice,Frosting|Pie:Bake,Crust,Slice|Brownie:Square,Chocolate,Bake|Muffin:Bake,Cup,Top|Donut:Hole,Glaze,Fry|Croissant:Flaky,France,Crescent|Bagel:Hole,Boil,Cream|Toast:Bread,Burn,Morning|Pancake:Flat,Syrup,Flip|Waffle:Grid,Syrup,Iron|Cereal:Bowl,Milk,Morning|Oatmeal:Bowl,Hot,Grain|Granola:Crunch,Yogurt,Oats|Yogurt:Dairy,Spoon,Fruit|Ice Cream:Cold,Cone,Scoop|Popsicle:Cold,Stick,Ice|Gelato:Italy,Cold,Scoop|Sorbet:Fruit,Cold,Scoop|Soup:Bowl,Spoon,Hot|Stew:Bowl,Thick,Meat|Chili:Bowl,Spicy,Beans|Curry:Spicy,India,Sauce|Sandwich:Bread,Meat,Eat|Wrap:Tortilla,Fold,Eat|Burrito:Tortilla,Beans,Foil|Quesadilla:Tortilla,Cheese,Flat|Enchilada:Tortilla,Sauce,Bake|Tamale:Corn,Husk,Steam|Dumpling:Dough,Fill,Steam|Sashimi:Slice,Fish,Raw|Tempura:Fry,Batter,Japan|Ramen:Bowl,Noodle,Japan|Udon:Thick,Noodle,Japan|Pho:Bowl,Noodle,Vietnam|Bacon:Pork,Fry,Strips|Sausage:Link,Pork,Grill|Nutmeg:Spice,Grate,Bake|Cinnamon:Spice,Stick,Roll"
    }
]

for pack in packs:
    pack_id = pack["id"]
    name = pack["name"]
    emoji = pack["emoji"]
    desc = pack["desc"]
    var_name = pack["var"]
    
    
    words_data = pack["data"].split("|")
    if pack_id == "animals":
        words_data += "Panda:Bamboo,Bear,China|Lemur:Madagascar,Ring,Tail|Meerkat:Stand,Desert,Timon|Baboon:Ape,Red,Bottom|Wolverine:Fierce,Claws,Wild".split("|")
    if pack_id == "campus-life":
        words_data += "Roommate:Share,Dorm,Live".split("|")
    if pack_id == "food":
        words_data += "Pretzel:Twist,Salt,Bake|Popcorn:Movie,Snack,Butter".split("|")
    
    words_data = [w for w in words_data if w.strip()]
    words_data = words_data[:120]

    json_words = []
    
    ts_lines = [
        "import type { WordEntry } from '../../../types/packs'",
        "",
        f"export const {var_name}: WordEntry[] = ["
    ]
    
    for i, w in enumerate(words_data):
        if not w.strip(): continue
        word, hints_str = w.split(":")
        hints = hints_str.split(",")
        json_words.append({"word": word, "hints": hints})
        
        hints_json = json.dumps(hints)
        ts_lines.append(f'  {{ "id": "{pack_id}_{i+1}", "word": "{word}", "category": "{name}", "hints": {hints_json} }},')
    
    ts_lines.append("] as const")
    
    json_obj = {
        "id": pack_id,
        "name": name,
        "emoji": emoji,
        "description": desc,
        "words": json_words
    }
    
    ts_filename = pack_id
    if pack_id == "campus-life": ts_filename = "campusLife"
    
    ts_path = f"c:\\Users\\sam\\Documents\\Projects\\wordmask\\packages\\core\\src\\packs\\data\\packs\\{ts_filename}.ts"
    json_path = f"c:\\Users\\sam\\Documents\\Projects\\wordmask\\packages\\core\\src\\packs\\data\\{pack_id}.json"
    
    powershell_set_content(json_path, json.dumps(json_obj, indent=2))
    powershell_set_content(ts_path, "\\n".join(ts_lines))
    print(f"Generated {pack_id} with {len(words_data)} words")
