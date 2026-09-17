/**
 * Curated list of short, common, easy-to-type English words for passphrases.
 * Entropy is always computed from the de-duplicated length of this list,
 * so adding or removing words keeps the math honest.
 */
const RAW = `
able acid acorn actor adapt admit adobe agent agile aisle alarm album alert alien alley alloy alpha amber ample angel angle ankle apple april apron arena argue armor aroma arrow artist aspen atlas atom attic audio autumn avid award awake axis
bacon badge bagel baker balmy bamboo banjo barn basil basin batch beach beacon beard beaver bench berry bible bingo birch bison blade blank blaze blend bliss bloom blues blunt board boat bonus boost booth botany bounce brass brave bread breeze brick bride brisk broad brook broom brush bubble bucket buddy buggy bundle bunny burst butter button
cabin cable cactus cadet camel camera canal candle candy canoe canvas canyon cargo carol carpet carrot cedar cello chalk charm cheek cheese cherry chess chief chili chimp chord cider cinema circus citrus civic claim clamp clay clerk cliff climb cloak clock cloud clover coach coast cobalt cocoa coffee comet comic coral cork cosmic cotton couch cougar count cover coyote crab craft crane crate crayon creek crisp crown crumb crust crystal cubic cupid curry cycle
daily dairy daisy dance dandy dart dawn debut decaf decoy delta denim depot desert detour dial diary diner dingo disco ditto diver dizzy dock dolphin domain donut doodle dove dozen draft dragon drama dream drift drill drum duck dune dusk dusty dwarf
eagle early earth easel echo eclipse edge eerie elbow elder elegy elite elm ember emblem emerald empty enigma envoy epic equal essay ether evoke exact exile expo extra
fable fabric facet fairy falcon fancy fargo feast feather fence fern ferry fetch fiber fiddle field fiesta finch fjord flag flair flame flash fleet flint float flora flour fluff flute focus foggy folio forest forge fossil fox frame fresh frost fudge fungi funky furry fuzzy
gadget galaxy gale gamma garden garlic gazebo gecko gem genie giant ginger giraffe glacier glade glass gleam glide globe glory glove glow gnome goat golden gopher gospel grain grape graph grassy gravy green grid grin grove guava guide guitar gumbo gusto gypsum
habit haiku hammer hamper handy harbor harp harvest hatch haven hazel heart hedge helium helmet hermit hero heron hiking hippo hobby honey hoop horizon hornet hotel hound humble humid hummus husky hybrid hydra
icicle icon idea igloo image inbox index indigo ink inlet input ionic iris iron island ivory ivy
jacket jaguar jam jasmine jazz jelly jester jewel jigsaw jingle jockey jolly journal joy judge juggle juice jumbo jungle juniper jury
kale kayak kebab kelp kennel ketchup kettle kiosk kitten kiwi knack knight koala kudos
label ladder lagoon lamb lantern laptop larch laser latch lava lawn layer lemon lens lentil level lilac lily limber linen lion llama lobby lobster locket lodge lofty logic lotus lucky lumber lunar lyric
macaw magic magnet mango maple marble marsh mascot matrix meadow medal melody melon mentor meteor metro mimic mint mirror mocha modem mohair molar monk moose mosaic moss motel motor mural museum mushroom music mystic
nacho napkin narwhal nebula nectar needle neon nest nickel nimble ninja noble nomad noodle north nova novel nugget nutmeg nylon
oasis oat ocean octave octopus olive omega onion onyx opal opera optic orange orbit orchid organ osprey otter outlaw oval owl oxygen oyster
paddle pagoda palace panda panel papaya parade parcel parrot pasta pastel patio peach peanut pearl pebble pecan pedal pelican penguin pepper petal piano pickle pilot pine pixel pizza planet plaza plume plush pocket poem polar pony poppy portal potato powder prairie prism puffin pulse pumpkin puppy puzzle
quail quake quartz quest quiet quill quilt quiver quota
rabbit racoon radar radio radish raft rain rally ramen ranch raven razor recipe reef relic remix rhino rhythm ribbon ridge ripple river robin robot rocket rodeo roost rose ruby rugby ruler rustic
saddle safari saga salad salmon salsa sandal sapphire satin sauna savvy scarf scone scout sculpt season seed sequel shadow shark shell sherpa shield shrimp silk silver siren sketch skiff sleek slope smile snack snail sonic sonnet spark sparrow spice spiral splash spoon spruce squid stable stamp starry steam stellar stone storm studio sugar summit sunny surf swan sweater swift syrup
taco talon tango tapir tartan teapot temple tennis tent thistle thunder tiger timber toast toffee tomato topaz torch totem toucan tower trail tribe trophy tulip tundra turtle tuxedo twig twilight
ultra umber umbrella unicorn union unity upbeat urban utopia
valley vanilla vapor velvet venus verse vessel vibe violet violin viper visor vista vivid vocal voyage vulcan
waffle wagon walnut walrus wander warm wasabi waterfall wave wax whale wheat whisk whistle willow window winter wisdom wizard wombat wonder woods woven wren
xenon yacht yak yarn yeti yodel yogurt yonder yucca yummy
zebra zenith zephyr zero zesty zigzag zinc zipper zodiac zombie zone zoom
`;

export const WORDLIST: readonly string[] = Array.from(
  new Set(RAW.split(/\s+/).filter(Boolean).map((w) => w.toLowerCase())),
);
