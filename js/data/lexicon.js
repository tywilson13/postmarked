// Word lists for Chain Letter and the mystery sender.
// "Name|Alias" — aliases are other spellings of the same thing. Chain letters use whichever
// spelling the player typed, so "Hippo" ends in O and "Hippopotamus" ends in S.
// Tiers: common · uncommon (shown as Scarce) · rare · legendary (shown as Priceless).
window.PM_LEXICON = {
  animals: {
    tiers: {
      common: [
        'Cat', 'Dog', 'Cow', 'Horse', 'Pig', 'Sheep', 'Goat', 'Chicken|Hen', 'Duck', 'Mouse|Mice', 'Rat', 'Rabbit|Bunny',
        'Lion', 'Tiger', 'Bear', 'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Gorilla', 'Kangaroo', 'Koala', 'Panda|Giant panda',
        'Penguin', 'Dolphin', 'Whale', 'Shark', 'Frog', 'Snake', 'Turtle', 'Owl', 'Eagle', 'Parrot', 'Bee|Honeybee',
        'Ant', 'Butterfly', 'Spider', 'Fox', 'Wolf|Wolves', 'Deer', 'Squirrel', 'Hippo|Hippopotamus', 'Rhino|Rhinoceros',
        'Crocodile', 'Alligator', 'Camel', 'Donkey', 'Bat', 'Hedgehog', 'Otter', 'Seal', 'Octopus|Octopi', 'Jellyfish', 'Crab',
        'Lobster', 'Swan', 'Goose|Geese', 'Turkey', 'Pigeon', 'Crow', 'Robin', 'Flamingo', 'Peacock', 'Ostrich', 'Polar bear',
        'Sloth', 'Raccoon|Racoon', 'Skunk', 'Beaver', 'Moose', 'Lizard', 'Leopard', 'Cheetah', 'Jaguar', 'Hamster', 'Worm',
        'Snail', 'Ladybug|Ladybird', 'Mosquito', 'Fly|Housefly', 'Llama', 'Pony', 'Bull', 'Ox|Oxen', 'Chipmunk', 'Starfish|Sea star'
      ],
      uncommon: [
        'Antelope', 'Armadillo', 'Badger', 'Bison', 'Buffalo', 'Caribou', 'Chameleon', 'Chimpanzee|Chimp', 'Cobra', 'Cougar',
        'Coyote', 'Crane', 'Cricket', 'Dingo', 'Dragonfly', 'Eel', 'Elk', 'Emu', 'Ferret', 'Firefly', 'Gazelle', 'Gecko',
        'Gerbil', 'Goldfish', 'Gopher', 'Grasshopper', 'Guinea pig', 'Hare', 'Hawk', 'Heron', 'Hummingbird', 'Hyena|Hyaena',
        'Iguana', 'Jackal', 'Kiwi', 'Lemur', 'Alpaca', 'Lynx', 'Macaw', 'Magpie', 'Manatee', 'Meerkat', 'Mole', 'Mongoose',
        'Moth', 'Mule', 'Narwhal', 'Newt', 'Orangutan|Orangutang', 'Orca|Killer whale', 'Panther', 'Pelican', 'Platypus',
        'Porcupine', 'Possum', 'Opossum', 'Puffin', 'Puma', 'Python', 'Quail', 'Rattlesnake', 'Raven', 'Reindeer',
        'Salamander', 'Salmon', 'Scorpion', 'Sea lion', 'Seahorse', 'Shrimp|Prawn', 'Sparrow', 'Squid', 'Stingray', 'Stork',
        'Swallow', 'Tadpole', 'Toad', 'Toucan', 'Trout', 'Tuna', 'Vulture', 'Walrus', 'Warthog', 'Wasp', 'Weasel', 'Wombat',
        'Woodpecker', 'Yak', 'Tarantula', 'Wallaby', 'Red panda', 'Snow leopard', 'Mink', 'Baboon', 'Beetle', 'Caterpillar',
        'Centipede', 'Clownfish', 'Cod', 'Condor', 'Dove', 'Falcon', 'Finch', 'Koi', 'Wildebeest|Gnu', 'Tortoise', 'Anaconda',
        'Ape', 'Viper', 'Kingfisher', 'Oyster', 'Clam', 'Earthworm', 'Grizzly|Grizzly bear', 'Brown bear', 'Black bear',
        'Blue whale', 'Humpback|Humpback whale', 'Sea otter', 'Sea turtle', 'Bumblebee', 'Hornet', 'Termite', 'Cockroach|Roach',
        'Flea', 'Tick', 'Mussel', 'Pheasant', 'Parakeet|Budgie|Budgerigar', 'Canary', 'Cardinal', 'Blue jay|Jay', 'Seagull|Gull',
        'Kookaburra', 'Komodo dragon', 'Tasmanian devil', 'Mammoth|Woolly mammoth'
      ],
      rare: [
        'Aardvark', 'Albatross', 'Anteater', 'Barracuda', 'Bobcat', 'Capybara', 'Cassowary', 'Chinchilla', 'Cockatoo', 'Coati',
        'Dormouse', 'Dugong', 'Echidna', 'Egret', 'Ermine', 'Gharial', 'Gila monster', 'Hammerhead|Hammerhead shark', 'Ibex',
        'Ibis', 'Impala', 'Kudu', 'Lamprey', 'Lemming', 'Lyrebird', 'Manta ray|Manta', 'Marmot', 'Marten', 'Mandrill',
        'Mantis|Praying mantis', 'Muskox|Musk ox', 'Nightingale', 'Ocelot', 'Oryx', 'Osprey', 'Pangolin', 'Partridge',
        'Piranha', 'Quokka', 'Roadrunner', 'Serval', 'Shrew', 'Skink', 'Stoat', 'Sugar glider', 'Tamarin', 'Vole',
        'Wolverine', 'Bonobo', 'Gibbon', 'Marmoset', 'Macaque', 'Caracal', 'Fennec|Fennec fox', 'Hyrax', 'Jerboa', 'Kea',
        'Loris|Slow loris', 'Pika', 'Urchin|Sea urchin', 'Vicuna|Vicuña', 'Wallaroo', 'Krill', 'Katydid', 'Oriole', 'Chamois',
        'Mouflon', 'Springbok', 'Eland', 'Bilby', 'Bandicoot', 'Galah', 'Kinkajou', 'Okapi', 'Tapir', 'Mudskipper',
        'Angelfish', 'Pufferfish|Blowfish', 'Swordfish', 'Catfish', 'Beluga', 'Manatee', 'Puffin', 'Yellowjacket',
        'Basilisk', 'Iguanodon', 'Gannet', 'Cormorant', 'Pelican', 'Wren', 'Starling', 'Thrush', 'Lark', 'Ptarmigan',
        'Hoopoe', 'Kestrel', 'Condor', 'Dodo', 'Sable', 'Polecat', 'Muntjac', 'Reedbuck', 'Agouti', 'Rhea', 'Dik-dik|Dikdik',
        'Gerenuk', 'Tarsier', 'Indri', 'Takin', 'Markhor', 'Saiga', 'Addax', 'Zebu', 'Uakari', 'Tuatara', 'Quoll', 'Numbat',
        'Quetzal', 'Axolotl', 'Electric eel', 'Hermit crab'
      ],
      legendary: [
        'Aye-aye|Ayeaye', 'Binturong', 'Blobfish', 'Fossa', 'Hoatzin', 'Kakapo', 'Olm', 'Saola', 'Shoebill', 'Vaquita',
        'Wobbegong', 'Xerus', 'Zorilla', 'Quagga', 'Coelacanth', 'Potoo', 'Solenodon', 'Tenrec', 'Babirusa', 'Hellbender',
        'Umbrellabird', 'Yapok', 'X-ray tetra|Xray tetra', 'Okapi', 'Pademelon', 'Potoroo', 'Bettong', 'Cuscus', 'Gharial',
        'Kiang', 'Onager', 'Dhole', 'Jabiru', 'Ibisbill', 'Quelea', 'Yellowhammer', 'Zokor', 'Nudibranch', 'Tardigrade|Water bear',
        'Glass frog', 'Leafy seadragon|Leafy sea dragon', 'Echidna', 'Elephant shrew|Sengi'
      ]
    },
    nope: {
      'Bird|Fish|Insect|Mammal|Reptile|Bug|Animal|Amphibian|Pet': 'Too general. Name a kind!',
      'Puppy|Kitten|Kitty|Calf|Lamb|Cub|Foal|Chick|Joey|Kid|Piglet|Duckling|Fawn': "That's a baby! Name the grown-up.",
      'Unicorn|Dragon|Phoenix|Mermaid|Yeti|Bigfoot|Griffin|Pegasus': 'Lovely, but not on Pip’s route.',
      'Dinosaur|T rex|Trex|Tyrannosaurus|Triceratops|Velociraptor|Stegosaurus': 'A little before Pip’s time!'
    }
  },

  countries: {
    tiers: {
      common: [
        'United States|USA|America|US', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'United Kingdom|UK|Britain|Great Britain',
        'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Russia', 'China', 'Japan', 'India', 'Australia', 'Egypt',
        'South Africa', 'Ireland', 'Greece', 'Sweden', 'Norway', 'Iceland', 'Peru', 'Chile', 'Cuba', 'Jamaica', 'Thailand',
        'New Zealand', 'Netherlands|Holland', 'Switzerland', 'Poland', 'Turkey|Turkiye|Türkiye', 'South Korea|Korea', 'Vietnam',
        'Israel', 'Iran', 'Iraq', 'Colombia', 'Denmark', 'Finland', 'Austria', 'Belgium', 'Indonesia', 'Philippines',
        'Ukraine', 'Morocco', 'Saudi Arabia', 'Pakistan', 'Kenya', 'Nigeria'
      ],
      uncommon: [
        'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panama', 'Honduras', 'Guatemala', 'Nicaragua',
        'El Salvador', 'Belize', 'Haiti', 'Dominican Republic', 'Bahamas', 'Scotland', 'Wales', 'England', 'Czechia|Czech Republic',
        'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Slovakia', 'Slovenia', 'Estonia', 'Latvia', 'Lithuania',
        'Belarus', 'Luxembourg', 'Monaco', 'Malta', 'Cyprus', 'Albania', 'Nepal', 'Mongolia', 'Kazakhstan', 'Sri Lanka',
        'Bangladesh', 'Myanmar|Burma', 'Cambodia', 'Laos', 'Malaysia', 'Singapore', 'North Korea', 'Taiwan',
        'United Arab Emirates|UAE', 'Qatar', 'Kuwait', 'Jordan', 'Lebanon', 'Syria', 'Yemen', 'Oman', 'Afghanistan',
        'Ethiopia', 'Ghana', 'Tanzania', 'Uganda', 'Zimbabwe', 'Madagascar', 'Somalia', 'Sudan', 'Libya', 'Tunisia', 'Algeria',
        'Senegal', 'Congo', 'Angola', 'Namibia', 'Botswana', 'Rwanda', 'Fiji', 'Papua New Guinea', 'Maldives',
        'Vatican City|Vatican|Holy See', 'Bosnia and Herzegovina|Bosnia', 'Montenegro', 'Georgia', 'Armenia', 'Azerbaijan',
        'Uzbekistan', 'Mozambique', 'Zambia', 'Cameroon', 'Ivory Coast|Cote d’Ivoire|Cote dIvoire', 'Mali', 'Bahrain',
        'Trinidad and Tobago|Trinidad', 'Barbados', 'Seychelles', 'Mauritius', 'Bhutan', 'Liechtenstein', 'Andorra', 'San Marino'
      ],
      rare: [
        'Moldova', 'North Macedonia|Macedonia', 'Kosovo', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Brunei',
        'East Timor|Timor-Leste|Timor Leste', 'Malawi', 'Lesotho', 'Burundi', 'Djibouti', 'Eritrea', 'South Sudan', 'Chad',
        'Niger', 'Burkina Faso', 'Benin', 'Togo', 'Guinea', 'Sierra Leone', 'Liberia', 'Gambia|The Gambia', 'Mauritania',
        'Gabon', 'Central African Republic', 'Equatorial Guinea', 'Guyana', 'Suriname', 'Samoa', 'Tonga', 'Vanuatu',
        'Solomon Islands', 'Grenada', 'Saint Lucia|St Lucia', 'Dominica', 'Antigua and Barbuda|Antigua',
        'Saint Kitts and Nevis|St Kitts and Nevis', 'Saint Vincent and the Grenadines|St Vincent', 'Cape Verde|Cabo Verde',
        'Comoros', 'Micronesia', 'Marshall Islands', 'Palau', 'Democratic Republic of the Congo|DRC|DR Congo'
      ],
      legendary: ['Nauru', 'Tuvalu', 'Kiribati', 'Sao Tome and Principe|São Tomé and Príncipe', 'Guinea-Bissau|Guinea Bissau', 'Eswatini|Swaziland']
    },
    nope: {
      'Hawaii|Puerto Rico|Guam|Greenland|Tahiti|Bermuda|Hong Kong|Macau|Tibet': 'That’s a territory, not quite a country.',
      'Africa|Europe|Asia|Antarctica|South America|North America|Oceania': 'That’s a continent. Name a country!'
    }
  }
};
