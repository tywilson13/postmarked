window.PM_ORDER = (window.PM_ORDER || []).concat([
  // ---------- Level 1 ----------
  { ask: "Tallest to shortest", top: "Tallest", bottom: "Shortest", level: 1, topic: "buildings",
    items: [
      { t: "Burj Khalifa", v: 828, show: "828 m" },
      { t: "Shanghai Tower", v: 632, show: "632 m" },
      { t: "Eiffel Tower", v: 330, show: "330 m" },
      { t: "Statue of Liberty", v: 93, show: "93 m (with base)" },
      { t: "Arc de Triomphe", v: 50, show: "50 m" }
    ],
    fact: "The Eiffel Tower can grow by up to about 15 cm on hot summer days as its iron expands." },

  { ask: "Biggest country first", top: "Biggest", bottom: "Smallest", level: 1, topic: "countries",
    items: [
      { t: "Russia", v: 17100000, show: "17.1 million km²" },
      { t: "Australia", v: 7690000, show: "7.7 million km²" },
      { t: "India", v: 3290000, show: "3.3 million km²" },
      { t: "Germany", v: 357000, show: "357,000 km²" },
      { t: "Switzerland", v: 41300, show: "41,300 km²" }
    ],
    fact: "Russia covers more ground than the entire surface of Pluto." },

  { ask: "Most people first", top: "Most", bottom: "Fewest", level: 1, topic: "countries",
    items: [
      { t: "India", v: 1400000000, show: "about 1.4 billion" },
      { t: "United States", v: 335000000, show: "about 335 million" },
      { t: "Japan", v: 124000000, show: "about 124 million" },
      { t: "Canada", v: 40000000, show: "about 40 million" },
      { t: "Ireland", v: 5300000, show: "about 5.3 million" }
    ],
    fact: "India passed China as the world’s most populous country in 2023." },

  { ask: "Longest river first", top: "Longest", bottom: "Shortest", level: 1, topic: "rivers",
    items: [
      { t: "Nile", v: 6650, show: "6,650 km" },
      { t: "Mississippi", v: 3730, show: "3,730 km" },
      { t: "Danube", v: 2850, show: "2,850 km" },
      { t: "Hudson", v: 507, show: "507 km" },
      { t: "Thames", v: 346, show: "346 km" }
    ],
    fact: "The Danube flows through 10 countries, more than any other river on Earth." },

  { ask: "Highest peak first", top: "Highest", bottom: "Lowest", level: 1, topic: "mountains",
    items: [
      { t: "Mount Everest", v: 8849, show: "8,849 m" },
      { t: "Kilimanjaro", v: 5895, show: "5,895 m" },
      { t: "Mont Blanc", v: 4806, show: "about 4,800 m" },
      { t: "Mount Fuji", v: 3776, show: "3,776 m" },
      { t: "Ben Nevis", v: 1345, show: "1,345 m" }
    ],
    fact: "Mont Blanc’s height shifts by a meter or two over the years as its icy summit cap grows and shrinks." },

  { ask: "Biggest team on the field", top: "Most", bottom: "Fewest", level: 1, topic: "sports",
    items: [
      { t: "Rugby union", v: 15, show: "15 players" },
      { t: "Soccer", v: 11, show: "11 players" },
      { t: "Baseball", v: 9, show: "9 players" },
      { t: "Basketball", v: 5, show: "5 players" },
      { t: "Beach volleyball", v: 2, show: "2 players" }
    ],
    fact: "Rugby union fields 15 a side, while its cousin rugby league plays with 13." },

  { ask: "Longest race first", top: "Longest", bottom: "Shortest", level: 1, topic: "sports",
    items: [
      { t: "Tour de France", v: 3400, show: "about 3,400 km" },
      { t: "Indianapolis 500", v: 805, show: "805 km (500 mi)" },
      { t: "Marathon", v: 42.2, show: "42.2 km" },
      { t: "5K fun run", v: 5, show: "5 km" },
      { t: "100-meter dash", v: 0.1, show: "0.1 km (100 m)" }
    ],
    fact: "The marathon’s odd 26.2 miles dates back to the course of the 1908 London Olympics." },

  { ask: "Biggest state first", top: "Biggest", bottom: "Smallest", level: 1, topic: "us states",
    items: [
      { t: "Alaska", v: 665384, show: "665,000 sq mi" },
      { t: "Texas", v: 268596, show: "269,000 sq mi" },
      { t: "California", v: 163695, show: "164,000 sq mi" },
      { t: "New York", v: 54555, show: "55,000 sq mi" },
      { t: "Rhode Island", v: 1545, show: "1,545 sq mi" }
    ],
    fact: "You could fit Rhode Island into Alaska more than 400 times." },

  { ask: "Farthest from London", top: "Farthest", bottom: "Closest", level: 1, topic: "distances",
    items: [
      { t: "Sydney", v: 16990, show: "about 17,000 km" },
      { t: "Cape Town", v: 9670, show: "about 9,700 km" },
      { t: "Chicago", v: 6350, show: "about 6,350 km" },
      { t: "Moscow", v: 2500, show: "about 2,500 km" },
      { t: "Paris", v: 344, show: "about 340 km" }
    ],
    fact: "The exact opposite point on the globe from London lies in the ocean near New Zealand." },

  { ask: "Most chunks in a game", top: "Most", bottom: "Fewest", level: 1, topic: "sports",
    items: [
      { t: "Baseball game", v: 9, show: "9 innings" },
      { t: "Grand Slam (men)", v: 5, show: "up to 5 sets" },
      { t: "NBA game", v: 4, show: "4 quarters" },
      { t: "NHL game", v: 3, show: "3 periods" },
      { t: "Soccer match", v: 2, show: "2 halves" }
    ],
    fact: "Women’s Grand Slam tennis matches are best of three, so they top out at three sets." },

  { ask: "Fastest first", top: "Fastest", bottom: "Slowest", level: 1, topic: "everyday",
    items: [
      { t: "Jet airliner (cruise)", v: 560, show: "about 560 mph" },
      { t: "Bullet train", v: 200, show: "about 200 mph" },
      { t: "Car on the highway", v: 70, show: "70 mph" },
      { t: "Usain Bolt (top speed)", v: 27.8, show: "about 28 mph" },
      { t: "Brisk walk", v: 3, show: "about 3 mph" }
    ],
    fact: "At full tilt, Usain Bolt would be speeding in plenty of school zones." },

  { ask: "Heaviest fruit first", top: "Heaviest", bottom: "Lightest", level: 1, topic: "food",
    items: [
      { t: "Watermelon", v: 7000, show: "about 7 kg" },
      { t: "Pineapple", v: 1500, show: "about 1.5 kg" },
      { t: "Apple", v: 180, show: "about 180 g" },
      { t: "Grape", v: 5, show: "about 5 g" },
      { t: "Grain of rice", v: 0.02, show: "about 0.02 g" }
    ],
    fact: "A one-pound bag of rice holds somewhere around 20,000 grains." },

  { ask: "Most pieces in the box", top: "Most", bottom: "Fewest", level: 1, topic: "games",
    items: [
      { t: "Scrabble", v: 100, show: "100 tiles" },
      { t: "Deck of playing cards", v: 52, show: "52 cards" },
      { t: "Chess set", v: 32, show: "32 pieces" },
      { t: "Checkers set", v: 24, show: "24 pieces" },
      { t: "Yahtzee", v: 5, show: "5 dice" }
    ],
    fact: "Two of Scrabble’s 100 tiles are blanks, and they’re worth zero points." },

  { ask: "Most calories first", top: "Most", bottom: "Fewest", level: 1, topic: "food",
    items: [
      { t: "Slice of cheese pizza", v: 285, show: "about 285 calories" },
      { t: "Can of Coke", v: 140, show: "140 calories" },
      { t: "Medium banana", v: 105, show: "about 105 calories" },
      { t: "Large egg", v: 72, show: "about 72 calories" },
      { t: "Cup of black coffee", v: 2, show: "about 2 calories" }
    ],
    fact: "Black coffee is nearly calorie-free; one tablespoon of heavy cream adds about 50." },

  { ask: "Most minutes on the clock", top: "Longest", bottom: "Shortest", level: 1, topic: "sports",
    items: [
      { t: "Soccer match", v: 90, show: "90 min" },
      { t: "NFL game", v: 60, show: "60 min" },
      { t: "NBA game", v: 48, show: "48 min" },
      { t: "UFC title fight", v: 25, show: "25 min (5 rounds)" },
      { t: "Pro boxing round", v: 3, show: "3 min" }
    ],
    fact: "An NFL game has just 60 minutes on the clock but usually takes more than three hours." },

  // ---------- Level 2 ----------
  { ask: "Most spaces on the board", top: "Most", bottom: "Fewest", level: 2, topic: "games",
    items: [
      { t: "Go", v: 361, show: "361 points" },
      { t: "Battleship", v: 100, show: "100 squares" },
      { t: "Chess", v: 64, show: "64 squares" },
      { t: "Monopoly", v: 40, show: "40 spaces" },
      { t: "Tic-tac-toe", v: 9, show: "9 squares" }
    ],
    fact: "Monopoly’s four corners are Go, Jail, Free Parking and Go to Jail." },

  { ask: "Farthest from Los Angeles", top: "Farthest", bottom: "Closest", level: 2, topic: "distances",
    items: [
      { t: "Sydney", v: 12050, show: "about 12,000 km" },
      { t: "London", v: 8760, show: "about 8,800 km" },
      { t: "New York", v: 3940, show: "about 3,900 km" },
      { t: "Mexico City", v: 2500, show: "about 2,500 km" },
      { t: "Las Vegas", v: 370, show: "about 370 km" }
    ],
    fact: "LA to London is farther than flying LA to New York and back again." },

  { ask: "Most residents first", top: "Most", bottom: "Fewest", level: 2, topic: "us states",
    items: [
      { t: "California", v: 39000000, show: "about 39 million" },
      { t: "Ohio", v: 11800000, show: "about 12 million" },
      { t: "Oregon", v: 4200000, show: "about 4.2 million" },
      { t: "Montana", v: 1100000, show: "about 1.1 million" },
      { t: "Wyoming", v: 585000, show: "under 600,000" }
    ],
    fact: "Wyoming is the least populous state, with fewer people than Washington, D.C." },

  { ask: "Biggest metro area first", top: "Biggest", bottom: "Smallest", level: 2, topic: "cities",
    items: [
      { t: "Tokyo", v: 37000000, show: "about 37 million" },
      { t: "New York", v: 20000000, show: "about 20 million" },
      { t: "Chicago", v: 9400000, show: "about 9.4 million" },
      { t: "Denver", v: 3000000, show: "about 3 million" },
      { t: "Reykjavik", v: 240000, show: "about 240,000" }
    ],
    fact: "About two-thirds of everyone in Iceland lives in and around Reykjavik." },

  { ask: "Largest lake first", top: "Largest", bottom: "Smallest", level: 2, topic: "lakes",
    items: [
      { t: "Caspian Sea", v: 371000, show: "371,000 km²" },
      { t: "Lake Superior", v: 82100, show: "82,100 km²" },
      { t: "Lake Baikal", v: 31500, show: "31,500 km²" },
      { t: "Lake Titicaca", v: 8370, show: "8,370 km²" },
      { t: "Lake Geneva", v: 580, show: "580 km²" }
    ],
    fact: "Baikal looks small next to Superior, yet holds more water than all five Great Lakes combined." },

  { ask: "Most sugar first", top: "Most", bottom: "Least", level: 2, topic: "food",
    items: [
      { t: "20-oz bottle of Coke", v: 65, show: "65 g" },
      { t: "Glass of orange juice", v: 21, show: "about 21 g" },
      { t: "Glass of milk", v: 12, show: "about 12 g" },
      { t: "Cup of strawberries", v: 7, show: "about 7 g" },
      { t: "Cup of raw broccoli", v: 1.5, show: "about 1.5 g" }
    ],
    fact: "A 20-ounce Coke holds about 16 teaspoons of sugar." },

  { ask: "Heaviest ball first", top: "Heaviest", bottom: "Lightest", level: 2, topic: "sports",
    items: [
      { t: "Basketball", v: 620, show: "about 620 g" },
      { t: "Soccer ball", v: 430, show: "about 430 g" },
      { t: "Baseball", v: 145, show: "about 145 g" },
      { t: "Tennis ball", v: 58, show: "about 58 g" },
      { t: "Golf ball", v: 45.9, show: "up to 45.9 g" }
    ],
    fact: "Rules cap a golf ball at 45.93 grams, which is about 1.62 ounces." },

  { ask: "Most native speakers", top: "Most", bottom: "Fewest", level: 2, topic: "languages",
    items: [
      { t: "Mandarin Chinese", v: 940000000, show: "about 940 million" },
      { t: "Spanish", v: 485000000, show: "about 485 million" },
      { t: "English", v: 380000000, show: "about 380 million" },
      { t: "Japanese", v: 123000000, show: "about 123 million" },
      { t: "Dutch", v: 24000000, show: "about 24 million" }
    ],
    fact: "Count learners too and English jumps to first, with roughly 1.5 billion speakers." },

  { ask: "Which landmark is tallest?", top: "Tallest", bottom: "Shortest", level: 2, topic: "landmarks",
    items: [
      { t: "Gateway Arch", v: 192, show: "192 m" },
      { t: "Great Pyramid of Giza", v: 139, show: "about 139 m" },
      { t: "Big Ben’s tower", v: 96, show: "96 m" },
      { t: "Taj Mahal", v: 73, show: "73 m" },
      { t: "Leaning Tower of Pisa", v: 56, show: "56 m" }
    ],
    fact: "The Great Pyramid was the tallest human-made structure on Earth for about 3,800 years." },

  { ask: "Long rivers, longest first", top: "Longest", bottom: "Shortest", level: 2, topic: "rivers",
    items: [
      { t: "Yangtze", v: 6300, show: "6,300 km" },
      { t: "Volga", v: 3530, show: "3,530 km" },
      { t: "Colorado", v: 2330, show: "2,330 km" },
      { t: "Rhine", v: 1230, show: "1,230 km" },
      { t: "Seine", v: 777, show: "777 km" }
    ],
    fact: "The Volga is Europe’s longest river, and it flows entirely within Russia." },

  { ask: "Biggest island first", top: "Biggest", bottom: "Smallest", level: 2, topic: "islands",
    items: [
      { t: "Borneo", v: 743000, show: "743,000 km²" },
      { t: "Madagascar", v: 587000, show: "587,000 km²" },
      { t: "Great Britain", v: 209000, show: "209,000 km²" },
      { t: "Iceland", v: 103000, show: "103,000 km²" },
      { t: "Sicily", v: 25700, show: "25,700 km²" }
    ],
    fact: "Borneo is split between three countries: Indonesia, Malaysia and Brunei." },

  { ask: "Biggest pour first", top: "Biggest", bottom: "Smallest", level: 2, topic: "drinks",
    items: [
      { t: "A US pint", v: 473, show: "473 ml (16 oz)" },
      { t: "Can of soda", v: 355, show: "355 ml (12 oz)" },
      { t: "Glass of wine", v: 148, show: "148 ml (5 oz)" },
      { t: "Shot of liquor", v: 44, show: "44 ml (1.5 oz)" },
      { t: "Shot of espresso", v: 30, show: "30 ml (1 oz)" }
    ],
    fact: "A British pint is 20 fluid ounces, about 20% more than an American one." },

  { ask: "Highest top score first", top: "Highest", bottom: "Lowest", level: 2, topic: "sports",
    items: [
      { t: "Perfect bowling game", v: 300, show: "300" },
      { t: "Darts (three darts)", v: 180, show: "180" },
      { t: "Snooker max break", v: 147, show: "147" },
      { t: "Blackjack hand", v: 21, show: "21" },
      { t: "Gymnastics perfect 10", v: 10, show: "10" }
    ],
    fact: "Gymnastics dropped the perfect-10 scoring system in 2006." },

  { ask: "Which summit is highest?", top: "Highest", bottom: "Lowest", level: 2, topic: "mountains",
    items: [
      { t: "K2", v: 8611, show: "8,611 m" },
      { t: "Denali", v: 6190, show: "6,190 m" },
      { t: "Matterhorn", v: 4478, show: "4,478 m" },
      { t: "Mount Olympus", v: 2918, show: "2,918 m" },
      { t: "Mount Washington (NH)", v: 1917, show: "1,917 m" }
    ],
    fact: "Denali rises about 5,500 m from its base, a bigger base-to-peak climb than Everest’s." },

  { ask: "Most populous first", top: "Most", bottom: "Fewest", level: 2, topic: "countries",
    items: [
      { t: "Indonesia", v: 280000000, show: "about 280 million" },
      { t: "Brazil", v: 210000000, show: "about 210 million" },
      { t: "Mexico", v: 130000000, show: "about 130 million" },
      { t: "Germany", v: 84000000, show: "about 84 million" },
      { t: "Australia", v: 27000000, show: "about 27 million" }
    ],
    fact: "Indonesia is the world’s fourth most populous country, spread over 17,000-plus islands." },

  { ask: "Tallest statue first", top: "Tallest", bottom: "Shortest", level: 2, topic: "landmarks",
    items: [
      { t: "Statue of Unity", v: 182, show: "182 m" },
      { t: "Statue of Liberty", v: 46, show: "46 m (statue only)" },
      { t: "Christ the Redeemer", v: 30, show: "30 m (statue only)" },
      { t: "Great Sphinx", v: 20, show: "about 20 m" },
      { t: "Michelangelo’s David", v: 5.17, show: "5.17 m" }
    ],
    fact: "Christ the Redeemer’s arms stretch about 28 m from fingertip to fingertip." },

  { ask: "Hottest pepper first", top: "Hottest", bottom: "Mildest", level: 2, topic: "food",
    items: [
      { t: "Ghost pepper", v: 1000000, show: "about 1 million" },
      { t: "Habanero", v: 200000, show: "about 200,000" },
      { t: "Cayenne", v: 40000, show: "about 40,000" },
      { t: "Jalapeño", v: 5000, show: "about 5,000" },
      { t: "Bell pepper", v: 0, show: "0" }
    ],
    fact: "On the Scoville scale, a ghost pepper can be around 200 times hotter than a jalapeño." },

  { ask: "Biggest ocean first", top: "Biggest", bottom: "Smallest", level: 2, topic: "oceans",
    items: [
      { t: "Pacific", v: 165000000, show: "165 million km²" },
      { t: "Atlantic", v: 106000000, show: "106 million km²" },
      { t: "Indian", v: 70000000, show: "70 million km²" },
      { t: "Southern", v: 21000000, show: "21 million km²" },
      { t: "Arctic", v: 15000000, show: "15 million km²" }
    ],
    fact: "The Pacific Ocean is bigger than all of Earth’s land put together." },

  { ask: "Most stars on the flag", top: "Most", bottom: "Fewest", level: 2, topic: "flags",
    items: [
      { t: "United States", v: 50, show: "50 stars" },
      { t: "Brazil", v: 27, show: "27 stars" },
      { t: "European Union", v: 12, show: "12 stars" },
      { t: "Australia", v: 6, show: "6 stars" },
      { t: "Vietnam", v: 1, show: "1 star" }
    ],
    fact: "Brazil’s flag shows the night sky over Rio, with a star for each state plus the capital." },

  { ask: "Longest from end to end", top: "Longest", bottom: "Shortest", level: 2, topic: "landmarks",
    items: [
      { t: "Great Wall of China", v: 21000, show: "about 21,000 km" },
      { t: "Route 66", v: 3940, show: "about 3,940 km" },
      { t: "Panama Canal", v: 82, show: "about 82 km" },
      { t: "Las Vegas Strip", v: 6.8, show: "about 6.8 km" },
      { t: "Central Park", v: 4, show: "about 4 km" }
    ],
    fact: "New York’s Central Park is bigger than the entire country of Monaco." },

  // ---------- Level 3 ----------
  { ask: "Most caffeine first", top: "Most", bottom: "Least", level: 3, topic: "drinks",
    items: [
      { t: "Cup of brewed coffee", v: 95, show: "about 95 mg" },
      { t: "Shot of espresso", v: 63, show: "about 63 mg" },
      { t: "Cup of black tea", v: 47, show: "about 47 mg" },
      { t: "Can of Coke", v: 34, show: "34 mg" },
      { t: "Cup of decaf coffee", v: 2, show: "about 2 mg" }
    ],
    fact: "Sip for sip espresso is stronger, but a regular cup of coffee usually packs more caffeine." },

  { ask: "Farthest north first", top: "Northmost", bottom: "Southmost", level: 3, topic: "cities",
    items: [
      { t: "Reykjavik", v: 64.1, show: "64.1° N" },
      { t: "London", v: 51.5, show: "51.5° N" },
      { t: "Toronto", v: 43.7, show: "43.7° N" },
      { t: "Miami", v: 25.8, show: "25.8° N" },
      { t: "Singapore", v: 1.35, show: "1.3° N" }
    ],
    fact: "London sits farther north than Calgary, Canada." },

  { ask: "Which is biggest by area?", top: "Biggest", bottom: "Smallest", level: 3, topic: "countries",
    items: [
      { t: "Alaska", v: 1723000, show: "1.72 million km²" },
      { t: "Texas", v: 696000, show: "696,000 km²" },
      { t: "France (mainland)", v: 551000, show: "about 551,000 km²" },
      { t: "Japan", v: 378000, show: "378,000 km²" },
      { t: "United Kingdom", v: 244000, show: "244,000 km²" }
    ],
    fact: "Texas is bigger than mainland France, and Alaska is more than twice the size of Texas." },

  { ask: "Farthest from New York", top: "Farthest", bottom: "Closest", level: 3, topic: "distances",
    items: [
      { t: "Honolulu", v: 7970, show: "about 7,970 km" },
      { t: "London", v: 5570, show: "about 5,570 km" },
      { t: "San Francisco", v: 4130, show: "about 4,130 km" },
      { t: "Miami", v: 1760, show: "about 1,760 km" },
      { t: "Boston", v: 306, show: "about 306 km" }
    ],
    fact: "Honolulu is about 2,400 km farther from New York than London is." },

  { ask: "Biggest number first", top: "Biggest", bottom: "Smallest", level: 3, topic: "everyday",
    items: [
      { t: "A ream of paper", v: 500, show: "500 sheets" },
      { t: "A gross", v: 144, show: "144" },
      { t: "Keys on a piano", v: 88, show: "88 keys" },
      { t: "A score", v: 20, show: "20" },
      { t: "A baker’s dozen", v: 13, show: "13" }
    ],
    fact: "“Four score and seven years ago” is a fancy way of saying 87 years ago." },

  { ask: "Who has more people?", top: "Most", bottom: "Fewest", level: 3, topic: "countries",
    items: [
      { t: "Pakistan", v: 240000000, show: "about 240 million" },
      { t: "Russia", v: 145000000, show: "about 145 million" },
      { t: "France", v: 68000000, show: "about 68 million" },
      { t: "Spain", v: 48000000, show: "about 48 million" },
      { t: "Portugal", v: 10400000, show: "about 10.4 million" }
    ],
    fact: "Pakistan has far more people than Russia, though Russia is nearly 20 times bigger." },

  { ask: "Biggest playing surface", top: "Biggest", bottom: "Smallest", level: 3, topic: "sports",
    items: [
      { t: "Soccer pitch", v: 7100, show: "about 7,100 m²" },
      { t: "NFL field", v: 5350, show: "about 5,350 m²" },
      { t: "NHL ice rink", v: 1500, show: "about 1,500 m²" },
      { t: "NBA court", v: 440, show: "about 440 m²" },
      { t: "Tennis court", v: 260, show: "about 260 m²" }
    ],
    fact: "A full-size soccer pitch is about a third bigger than an NFL field, end zones included." },

  { ask: "Highest net or hoop first", top: "Highest", bottom: "Lowest", level: 3, topic: "sports",
    items: [
      { t: "Basketball rim", v: 3.05, show: "3.05 m (10 ft)" },
      { t: "Volleyball net (men)", v: 2.43, show: "2.43 m (8 ft)" },
      { t: "Badminton net", v: 1.52, show: "1.52 m (5 ft)" },
      { t: "Tennis net (center)", v: 0.91, show: "0.91 m (3 ft)" },
      { t: "Ping-pong net", v: 0.15, show: "15 cm (6 in)" }
    ],
    fact: "A badminton net stands about 60 cm higher than a tennis net does at the center." },

  { ask: "Highest city first", top: "Highest", bottom: "Lowest", level: 3, topic: "cities",
    items: [
      { t: "La Paz", v: 3640, show: "about 3,640 m" },
      { t: "Quito", v: 2850, show: "about 2,850 m" },
      { t: "Mexico City", v: 2240, show: "about 2,240 m" },
      { t: "Denver", v: 1609, show: "1,609 m (1 mile)" },
      { t: "Madrid", v: 657, show: "about 657 m" }
    ],
    fact: "Up in La Paz, each breath holds roughly a third less oxygen than at sea level." },

  { ask: "Largest continent first", top: "Largest", bottom: "Smallest", level: 3, topic: "continents",
    items: [
      { t: "Asia", v: 44600000, show: "44.6 million km²" },
      { t: "Africa", v: 30300000, show: "30.3 million km²" },
      { t: "South America", v: 17800000, show: "17.8 million km²" },
      { t: "Antarctica", v: 14200000, show: "14.2 million km²" },
      { t: "Europe", v: 10200000, show: "10.2 million km²" }
    ],
    fact: "Antarctica is about 40% bigger than Europe." }
]);
