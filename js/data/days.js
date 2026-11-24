// Postmarked daily content. One object per day.
// Rule of thumb for writing: every question should have an answer almost anyone can give,
// plus room to do better. No "know it or you don't."

window.POSTMARKED_DAYS = [
  // ───────────────────────────── DAY 1 ─────────────────────────────
  {
    theme: "Southern Hemisphere Hellos",
    sender: {
      name: "Koala", emoji: "🐨", tint: "sage", answers: "Koala|Koala bear",
      clues: [
        "I live in the Southern Hemisphere.",
        "I sleep up to 20 hours a day.",
        "People call me a bear, but I'm not one.",
        "I eat leaves that would make most animals sick.",
        "I carry my baby in a pouch, and I live in gum trees in Australia."
      ],
      nope: { "Sloth": "Sleepy like me, but no.", "Kangaroo|Wallaby|Wombat": "We're cousins! Not quite." }
    },
    cryptic: {
      clue: "Solo, muddled, in a northern capital",
      enumeration: "(4)", answer: "OSLO",
      definition: "northern capital", optional: "in a",
      hints: [
        { label: "Wordplay", text: "“Muddled” tells you to rearrange the letters of SOLO." },
        { label: "Trivia", text: "The Nobel Peace Prize is awarded here." }
      ],
      explain: "SOLO, <i>muddled</i> (anagram) → <b>OSLO</b>, a northern capital."
    },
    postmark: [
      { country: "New Zealand", label: "New Zealand", fact: "The kiwi lays one of the biggest eggs for its size of any bird.",
        clues: [
          { kind: "Weather", text: "It's December, and it's the start of summer here." },
          { kind: "Coin", text: "A dollar coin with a flightless bird on it." },
          { kind: "Stamp", emoji: "🐑", text: "Sheep. There are about five of them for every person here." },
          { kind: "Greeting", text: "“Kia ora!” from a land of two big islands east of Australia." }
        ] },
      { country: "Argentina", label: "Argentina", fact: "Argentina is named after silver (argentum in Latin).",
        clues: [
          { kind: "Weather", text: "Hot in January, and dinner rarely starts before 9 p.m." },
          { kind: "Coin", text: "A peso." },
          { kind: "Stamp", emoji: "💃", text: "A couple dancing the tango." },
          { kind: "Greeting", text: "“¡Hola!” from Buenos Aires, next door to Chile." }
        ] },
      { country: "South Africa", label: "South Africa", fact: "South Africa has three capital cities: Pretoria, Cape Town and Bloemfontein.",
        clues: [
          { kind: "Note", text: "This country has three capital cities." },
          { kind: "Coin", text: "A rand, with a springbok on it." },
          { kind: "Stamp", emoji: "🐧", text: "Penguins on a beach near a flat-topped mountain." },
          { kind: "Greeting", text: "“Sawubona!” from the very southern tip of Africa." }
        ] }
    ],
    chain: { category: "animals", start: "Penguin" },
    missorted: {
      groups: [
        { name: "Things that waddle", items: ["Penguin", "Duck", "Goose", "Toddler"] },
        { name: "Pasta shapes", items: ["Macaroni", "Shells", "Bow ties", "Penne"] },
        { name: "Things with crowns", items: ["King", "Queen", "Tooth", "Pineapple"] }
      ],
      sneaky: "Macaroni and King are both kinds of penguin, too."
    },
    scale: [
      { q: "How fast can a red kangaroo hop?", answer: 44, unit: "mph", min: 0, max: 100, fact: "About 44 mph in short bursts, and they can clear 25 feet in a single bound." },
      { q: "How many kinds of penguin are there?", answer: 18, unit: "species", min: 1, max: 50, fact: "About 18, from the tiny little blue penguin to the emperor." },
      { q: "What year did the Sydney Opera House open?", answer: 1973, unit: "", min: 1900, max: 2020, year: true, fact: "1973. It took 14 years to build, ten years longer than planned." },
      { q: "How wide is Australia, coast to coast?", answer: 2500, unit: "miles", min: 200, max: 10000, log: true, fact: "About 2,500 miles. That's wider than the Moon." }
    ]
  },

  // ───────────────────────────── DAY 2 ─────────────────────────────
  {
    theme: "Paws Across Europe",
    sender: {
      name: "Corgi", emoji: "🐕", tint: "ochre", answers: "Corgi|Welsh corgi|Pembroke|Pembroke welsh corgi|Cardigan|Cardigan welsh corgi",
      clues: [
        "I was bred to herd cattle.",
        "My family comes from Wales.",
        "My legs are famously short.",
        "Queen Elizabeth II kept more than 30 of us.",
        "I'm a fluffy dog with big ears and a loaf-shaped bottom."
      ],
      nope: { "Dog|Puppy": "Yes, but what kind?", "Dachshund|Sausage dog|Beagle|Basset hound|Collie|Sheepdog": "Good guess, but not me!" }
    },
    cryptic: {
      clue: "Pairs dance around the City of Light",
      enumeration: "(5)", answer: "PARIS",
      definition: "City of Light", optional: "around the",
      hints: [
        { label: "Wordplay", text: "“Dance” tells you to rearrange the letters of PAIRS." },
        { label: "Trivia", text: "Its most famous tower was only supposed to stand for 20 years." }
      ],
      explain: "PAIRS, <i>dancing</i> (anagram) → <b>PARIS</b>, the City of Light."
    },
    postmark: [
      { country: "Netherlands", label: "Netherlands", fact: "There are more bicycles than people in the Netherlands.",
        clues: [
          { kind: "Note", text: "About a quarter of this country lies below sea level." },
          { kind: "Weather", text: "Flat, windy, and everybody rides a bike." },
          { kind: "Stamp", emoji: "🌷", text: "Tulips and a windmill." },
          { kind: "Greeting", text: "“Hoi!” from Amsterdam." }
        ] },
      { country: "Italy", label: "Italy", fact: "Italy has more UNESCO World Heritage Sites than almost any other country.",
        clues: [
          { kind: "Coin", text: "A euro with Leonardo da Vinci's drawing of a man in a circle." },
          { kind: "Stamp", emoji: "🐺", text: "A she-wolf caring for twin babies." },
          { kind: "Note", text: "Pizza, pasta, and a leaning tower." },
          { kind: "Greeting", text: "“Ciao!” from a country shaped like a boot." }
        ] },
      { country: "Ireland", label: "Ireland", fact: "Halloween began as the old Irish festival of Samhain.",
        clues: [
          { kind: "Coin", text: "A euro with a harp on it." },
          { kind: "Note", text: "Legend says a saint chased all the snakes away." },
          { kind: "Stamp", emoji: "☘️", text: "A shamrock." },
          { kind: "Greeting", text: "“Dia dhuit!” from the Emerald Isle, west of Britain." }
        ] }
    ],
    chain: { category: "animals", start: "Dachshund" },
    missorted: {
      groups: [
        { name: "Dogs named after places", items: ["Dalmatian", "Labrador", "Chihuahua", "Pomeranian"] },
        { name: "Cats named after places", items: ["Persian", "Siamese", "Burmese", "Siberian"] },
        { name: "Cheeses named after places", items: ["Cheddar", "Gouda", "Brie", "Parmesan"] }
      ],
      sneaky: "Siberian sounds like a husky, but the dogs already had four."
    },
    scale: [
      { q: "How many countries are in the European Union?", answer: 27, unit: "countries", min: 0, max: 60, fact: "27, since the UK left in 2020." },
      { q: "What year did the Channel Tunnel open?", answer: 1994, unit: "", min: 1900, max: 2020, year: true, fact: "1994. It runs about 31 miles from England to France." },
      { q: "How tall is the Eiffel Tower?", answer: 1083, unit: "feet", min: 100, max: 5000, log: true, fact: "About 1,083 feet, and it grows about 6 inches in summer heat." },
      { q: "How many islands is Venice built on?", answer: 118, unit: "islands", min: 1, max: 1000, log: true, fact: "About 118, linked by more than 400 bridges." }
    ]
  },

  // ───────────────────────────── DAY 3 ─────────────────────────────
  {
    theme: "Bears, Bats & Black-and-White",
    sender: {
      name: "Panda", emoji: "🐼", tint: "rose", answers: "Panda|Giant panda|Panda bear",
      clues: [
        "I'm black and white.",
        "I spend about half the day eating.",
        "My handy “thumb” is really a wrist bone.",
        "I live in the misty mountains of central China.",
        "I'm a bear who eats almost nothing but bamboo."
      ],
      nope: { "Red panda": "Close! But I'm the big one.", "Zebra|Penguin|Skunk|Orca|Badger|Cow": "Black and white, but not me!" }
    },
    cryptic: {
      clue: "Country, we hear, is cold",
      enumeration: "(5)", answer: "CHILE",
      definition: "Country", optional: "",
      hints: [
        { label: "Wordplay", text: "“We hear” means the answer sounds like a word that means cold." },
        { label: "Trivia", text: "It's home to the Atacama, one of the driest deserts on Earth." }
      ],
      explain: "A country that sounds like (<i>we hear</i>) CHILLY, meaning cold → <b>CHILE</b>."
    },
    postmark: [
      { country: "Canada", label: "Canada", fact: "Canada has the longest coastline of any country on Earth.",
        clues: [
          { kind: "Note", text: "This country has the longest coastline in the world." },
          { kind: "Coin", text: "A dollar coin called a “loonie,” after the bird on it." },
          { kind: "Stamp", emoji: "🍁", text: "A black bear under a maple leaf." },
          { kind: "Greeting", text: "“Hello, bonjour!” from just north of the United States." }
        ] },
      { country: "China", label: "China", fact: "The Great Wall, with all its branches, is over 13,000 miles long.",
        clues: [
          { kind: "Note", text: "The whole country uses one time zone, even though it's wide enough for five." },
          { kind: "Coin", text: "A yuan." },
          { kind: "Stamp", emoji: "🐼", text: "A black-and-white bear munching bamboo." },
          { kind: "Greeting", text: "“Nǐ hǎo!” from the home of a very long wall." }
        ] },
      { country: "Norway", label: "Norway", fact: "Norway has sent London a giant Christmas tree for Trafalgar Square every year since 1947.",
        clues: [
          { kind: "Weather", text: "In June, the sun doesn't set here for weeks." },
          { kind: "Coin", text: "A krone." },
          { kind: "Stamp", emoji: "🐻‍❄️", text: "A polar bear on an Arctic island." },
          { kind: "Greeting", text: "“Hei!” from a land of fjords, west of Sweden." }
        ] }
    ],
    chain: { category: "animals", start: "Zebra" },
    missorted: {
      groups: [
        { name: "Capitals hiding an animal", items: ["Rabat", "Moscow", "Muscat", "Bratislava"] },
        { name: "Capitals starting with B", items: ["Berlin", "Brussels", "Bangkok", "Beijing"] },
        { name: "Things with shells", items: ["Turtle", "Snail", "Egg", "Taco"] }
      ],
      sneaky: "Bratislava starts with B, but it's hiding a RAT! (RaBAT, MosCOW, MusCAT, BRATislava)"
    },
    scale: [
      { q: "How many kinds of bat are there?", answer: 1400, unit: "species", min: 10, max: 10000, log: true, fact: "More than 1,400. About one in five mammal species is a bat." },
      { q: "How many keys does a piano have?", answer: 88, unit: "keys", min: 10, max: 200, fact: "88: 52 white and 36 black." },
      { q: "How many hours a day does a little brown bat sleep?", answer: 20, unit: "hours", min: 0, max: 24, fact: "About 20. It's awake for only about four hours a night." },
      { q: "How long is Chile, top to bottom?", answer: 2650, unit: "miles", min: 200, max: 10000, log: true, fact: "About 2,650 miles, but on average only about 110 miles wide." }
    ]
  },

  // ───────────────────────────── DAY 4 ─────────────────────────────
  {
    theme: "Island Hopping",
    sender: {
      name: "Humpback whale", emoji: "🐋", tint: "sky", answers: "Humpback whale|Humpback|Whale",
      clues: [
        "I'm a mammal, but I never set foot on land.",
        "I sing songs that can go on for hours.",
        "I swim thousands of miles between warm and cold seas every year.",
        "My front flippers can be a third as long as my body.",
        "I'm a huge sea creature that breathes out a spout of spray."
      ],
      nope: { "Dolphin|Porpoise|Orca|Killer whale": "We're related, but I'm much bigger!", "Shark|Fish": "I'm not a fish at all!", "Blue whale": "A whale, yes, but not that kind. Just “whale” would do!" }
    },
    cryptic: {
      clue: "Island hidden in animal tails",
      enumeration: "(5)", answer: "MALTA",
      definition: "Island", optional: "",
      hints: [
        { label: "Wordplay", text: "“Hidden in” means the answer is spelled out inside the words “animal tails.”" },
        { label: "Trivia", text: "A Mediterranean island nation south of Sicily." }
      ],
      explain: "Hidden in ani<b>MAL TA</b>ils → <b>MALTA</b>, an island."
    },
    postmark: [
      { country: "Madagascar", label: "Madagascar", fact: "Lemurs live in the wild only on Madagascar and the nearby Comoro Islands.",
        clues: [
          { kind: "Note", text: "The world's fourth-largest island." },
          { kind: "Note", text: "Most of the wildlife here lives nowhere else on Earth." },
          { kind: "Greeting", text: "“Manao ahoana!”" },
          { kind: "Stamp", emoji: "🐒", text: "A ring-tailed lemur, off the coast of East Africa." }
        ] },
      { country: "Japan", label: "Japan", fact: "Japan has more than 14,000 islands.",
        clues: [
          { kind: "Stamp", emoji: "🦢", text: "A red-crowned crane." },
          { kind: "Coin", text: "A yen." },
          { kind: "Note", text: "Bullet trains, cherry blossoms, and a snowy volcano." },
          { kind: "Greeting", text: "“Konnichiwa!” from an island chain east of Korea." }
        ] },
      { country: "Iceland", label: "Iceland", fact: "The word “geyser” comes from Geysir, a hot spring in Iceland.",
        clues: [
          { kind: "Note", text: "This country has no army." },
          { kind: "Stamp", emoji: "🐦", text: "A puffin." },
          { kind: "Weather", text: "Glaciers, volcanoes, and hot springs." },
          { kind: "Greeting", text: "“Góðan dag!” from a big island between Norway and Greenland." }
        ] }
    ],
    chain: { category: "countries", start: "Cuba" },
    missorted: {
      groups: [
        { name: "Island countries", items: ["Malta", "Cuba", "Fiji", "Jamaica"] },
        { name: "___ Island", items: ["Easter", "Rhode", "Coney", "Treasure"] },
        { name: "Pirate things", items: ["Parrot", "Cutlass", "Eyepatch", "Plank"] }
      ],
      sneaky: "Treasure belongs with pirates too, but Treasure Island needed it more!"
    },
    scale: [
      { q: "How many islands make up the Philippines?", answer: 7641, unit: "islands", min: 10, max: 100000, log: true, fact: "7,641, though only about 2,000 have people living on them." },
      { q: "What share of Madagascar's wildlife lives nowhere else?", answer: 90, unit: "%", min: 0, max: 100, fact: "About 90%. It split off from Africa and India long ago." },
      { q: "How long can a blue whale grow?", answer: 100, unit: "feet", min: 5, max: 1000, log: true, fact: "About 100 feet, as long as three school buses." },
      { q: "How much does a blue whale's heart weigh?", answer: 400, unit: "pounds", min: 1, max: 10000, log: true, fact: "About 400 pounds. On a deep dive it beats only about twice a minute." }
    ]
  },

  // ───────────────────────────── DAY 5 ─────────────────────────────
  {
    theme: "Mountain Mail",
    sender: {
      name: "Llama", emoji: "🦙", tint: "ochre", answers: "Llama",
      clues: [
        "I live high in the mountains.",
        "I'm related to camels.",
        "If I'm annoyed, I might spit.",
        "People use me to carry packs on mountain trails in South America.",
        "I'm like an alpaca, but bigger, with banana-shaped ears."
      ],
      nope: { "Alpaca": "So close! I'm the bigger cousin.", "Camel": "Related, but no hump on me!", "Goat|Mountain goat|Yak|Sheep": "Good mountain guess, but no." }
    },
    cryptic: {
      clue: "Plane crashed in mountain country",
      enumeration: "(5)", answer: "NEPAL",
      definition: "mountain country", optional: "in",
      hints: [
        { label: "Wordplay", text: "“Crashed” tells you to rearrange the letters of PLANE." },
        { label: "Trivia", text: "Mount Everest sits on its northern border." }
      ],
      explain: "PLANE, <i>crashed</i> (anagram) → <b>NEPAL</b>, a mountain country."
    },
    postmark: [
      { country: "Switzerland", label: "Switzerland", fact: "Switzerland has four national languages: German, French, Italian and Romansh.",
        clues: [
          { kind: "Note", text: "This country has four national languages." },
          { kind: "Coin", text: "A franc." },
          { kind: "Stamp", emoji: "🐕", text: "A St. Bernard rescue dog with a little barrel." },
          { kind: "Greeting", text: "“Grüezi!” from the Alps, home of chocolate and cuckoo clocks." }
        ] },
      { country: "Peru", label: "Peru", fact: "Machu Picchu was built by the Inca around 1450.",
        clues: [
          { kind: "Weather", text: "The capital city almost never gets rain." },
          { kind: "Coin", text: "A sol, named after the sun." },
          { kind: "Stamp", emoji: "🦙", text: "A llama on a mountain-top city of stone." },
          { kind: "Greeting", text: "“¡Hola!” from the Andes, near Machu Picchu." }
        ] },
      { country: "Bhutan", label: "Bhutan", fact: "Bhutan's capital, Thimphu, has no traffic lights.",
        clues: [
          { kind: "Note", text: "This country measures “Gross National Happiness.”" },
          { kind: "Note", text: "Its capital has no traffic lights. A police officer waves the cars along." },
          { kind: "Stamp", emoji: "🐉", text: "A thunder dragon, from its flag." },
          { kind: "Greeting", text: "“Kuzu zangpo!” from a small Himalayan kingdom between India and China." }
        ] }
    ],
    chain: { category: "animals", start: "Yak" },
    missorted: {
      groups: [
        { name: "Mountains", items: ["Everest", "Kilimanjaro", "Matterhorn", "Denali"] },
        { name: "Apples", items: ["Fuji", "Gala", "Honeycrisp", "Granny Smith"] },
        { name: "Camera brands", items: ["Canon", "Nikon", "Kodak", "Olympus"] }
      ],
      sneaky: "Fuji and Olympus are mountains too!"
    },
    scale: [
      { q: "How tall is Mount Everest?", answer: 29032, unit: "feet", min: 5000, max: 60000, fact: "29,032 feet, and it's still growing a few millimeters a year." },
      { q: "How many mountains on Earth are taller than 8,000 meters?", answer: 14, unit: "peaks", min: 0, max: 60, fact: "14, all in the Himalayas and Karakoram." },
      { q: "What year did people first reach the top of Everest?", answer: 1953, unit: "", min: 1850, max: 2020, year: true, fact: "1953: Tenzing Norgay and Edmund Hillary." },
      { q: "How much can a llama comfortably carry?", answer: 75, unit: "pounds", min: 0, max: 400, fact: "About 75 pounds. Load one up too much and it may lie down and refuse to move." }
    ]
  }
];
