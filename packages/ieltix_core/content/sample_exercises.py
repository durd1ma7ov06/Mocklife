from dataclasses import dataclass
from typing import Sequence


@dataclass(frozen=True, slots=True)
class VocabItem:
    id: str
    word: str
    definition: str
    translation_uz: str
    part_of_speech: str
    cefr_level: str
    example_sentence: str
    collocations: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class Exercise:
    id: str
    skill: str
    prompt_uz: str
    prompt_en: str
    answer_key: str | None = None
    title_uz: str = ""
    title_en: str = ""
    category: str = ""
    difficulty: str = "Standard"
    passage_text: str | None = None
    options: tuple[str, ...] | None = None
    explanation_uz: str | None = None
    explanation_en: str | None = None
    acceptable_answers: tuple[str, ...] | None = None
    audio_url: str | None = None
    model_answer: str | None = None


# =============================================================================
# 📚 VOCAB VAULT (Akademik C1/C2 Smart Lug'at)
# =============================================================================
VOCAB_VAULT_ITEMS: list[VocabItem] = [
    VocabItem(
        id="v-1",
        word="Pivotal",
        definition="Of crucial importance in relation to the development or success of something else.",
        translation_uz="Hal qiluvchi, o'ta muhim",
        part_of_speech="adjective",
        cefr_level="C1",
        example_sentence="The technological revolution played a pivotal role in modern diagnostics.",
        collocations=("pivotal role", "pivotal moment", "pivotal decision"),
    ),
    VocabItem(
        id="v-2",
        word="Exacerbate",
        definition="To make a problem, bad situation, or negative feeling worse.",
        translation_uz="Og'irlashtirmoq, kuchaytirmoq",
        part_of_speech="verb",
        cefr_level="C2",
        example_sentence="Rapid urbanization can exacerbate environmental degradation in developing regions.",
        collocations=("exacerbate the problem", "exacerbate symptoms", "exacerbate tensions"),
    ),
    VocabItem(
        id="v-3",
        word="Discrepancy",
        definition="An illogical or unexpected lack of compatibility or similarity between two or more facts.",
        translation_uz="Tafovut, nomuvofiqlik",
        part_of_speech="noun",
        cefr_level="C1",
        example_sentence="There appears to be a noticeable discrepancy between the predicted and observed data.",
        collocations=("wide discrepancy", "apparent discrepancy", "explain the discrepancy"),
    ),
    VocabItem(
        id="v-4",
        word="Ubiquitous",
        definition="Present, appearing, or found everywhere.",
        translation_uz="Hamma joyda uchraydigan, yalpi tarqalgan",
        part_of_speech="adjective",
        cefr_level="C2",
        example_sentence="Smartphones have become ubiquitous in daily communications worldwide.",
        collocations=("ubiquitous presence", "become ubiquitous", "almost ubiquitous"),
    ),
    VocabItem(
        id="v-5",
        word="Feasible",
        definition="Possible to do easily or conveniently.",
        translation_uz="Amalga oshirib bo'ladigan, maqbul",
        part_of_speech="adjective",
        cefr_level="B2",
        example_sentence="Implementing renewable solar grids is increasingly feasible for modern municipalities.",
        collocations=("feasible solution", "economically feasible", "feasible alternative"),
    ),
    VocabItem(
        id="v-6",
        word="Phenomenon",
        definition="A remarkable fact or situation that is observed to exist or happen.",
        translation_uz="Hodisa, fenomen",
        part_of_speech="noun",
        cefr_level="C1",
        example_sentence="Urban biodiversity growth is a remarkable biological phenomenon.",
        collocations=("natural phenomenon", "cultural phenomenon", "widespread phenomenon"),
    ),
    VocabItem(
        id="v-7",
        word="Circumvent",
        definition="To find a way around an obstacle, regulation, or acoustic interference.",
        translation_uz="Aylanib o'tmoq, yo'lini topmoq",
        part_of_speech="verb",
        cefr_level="C1",
        example_sentence="Avian species circumvent morning acoustic interference by singing earlier.",
        collocations=("circumvent the problem", "circumvent regulations", "circumvent acoustic barriers"),
    ),
]


# =============================================================================
# 📖 READING MOCK PASSAGES & QUESTIONS
# =============================================================================
URBAN_BIODIVERSITY_PASSAGE = (
    "As metropolitan areas worldwide expand exponentially, urban ecologists have uncovered an unexpected biological "
    "phenomenon: cities are becoming evolutionary hotspots. Far from being ecological wastelands devoid of adaptive diversity, "
    "high-density concrete ecosystems exert fierce selective pressures on wildlife, accelerating phenotypic divergence at rates "
    "seldom recorded in untouched wilderness.\n\n"
    "A pivotal study conducted by the Global Urban Biome Initiative tracked White-footed mice (Peromyscus leucopus) "
    "inhabiting isolated public parks across New York City. Genetic sequencing revealed that city mice have developed distinct "
    "adaptations in metabolic and heavy-metal tolerance genes compared to their rural counterparts. These physiological mutations "
    "allow them to process carbohydrate-dense anthropogenic food waste without exacerbating systemic inflammation, and detoxify "
    "airborne lead particles embedded in park foliage.\n\n"
    "Furthermore, behavioral alterations in urban avian species highlight the ubiquitous nature of adaptation. In European "
    "metropolitan hubs, European blackbirds (Turdus merula) have modulated both the pitch and the circadian timing of their "
    "territorial songs. By shifting peak vocalization to pre-dawn intervals, avian populations circumvent acoustic interference "
    "generated by morning vehicular traffic. Urban noise pollution therefore acts as an immediate selective filter, rewarding "
    "specimens with elevated auditory frequencies.\n\n"
    "Critics often argue that urban evolution merely represents localized survivorship rather than authentic speciation. "
    "However, longitudinal genomic data demonstrates unambiguous reproductive isolation in multiple arthropod species "
    "trapped in subterranean transit networks, indicating that anthropogenic terrain is actively shaping new phylogenetic branches."
)


EXERCISES: dict[str, Exercise] = {
    # -------------------------------------------------------------------------
    # Reading Passage 1: Urban Biodiversity
    # -------------------------------------------------------------------------
    "reading-urban-1": Exercise(
        id="reading-urban-1",
        skill="reading",
        category="Passage 1 • Urban Ecology",
        difficulty="Band 6.5 – 7.5",
        title_uz="🌿 Shahar bioxilma-xilligining evolyutsiyasi (Q1: T/F/NG)",
        title_en="🌿 Urban Biodiversity Evolution (Q1: T/F/NG)",
        passage_text=URBAN_BIODIVERSITY_PASSAGE,
        prompt_uz="Matnga ko‘ra bayonot TRUE, FALSE yoki NOT GIVEN:\n«Wildlife adaptation occurs at a slower pace in urban centers than in untouched natural wilderness.»",
        prompt_en="According to the passage, choose TRUE, FALSE or NOT GIVEN:\n«Wildlife adaptation occurs at a slower pace in urban centers than in untouched natural wilderness.»",
        options=("TRUE", "FALSE", "NOT GIVEN"),
        answer_key="FALSE",
        explanation_uz="Matnda aniq aytilgan: shaharlar fenotipik o'zgarishlarni yovvoyi tabiatga qaraganda ancha tezlashtiradi (accelerating phenotypic divergence at rates seldom recorded in wilderness).",
        explanation_en="The text explicitly states that cities accelerate phenotypic divergence at rates seldom recorded in untouched wilderness.",
    ),
    "reading-urban-2": Exercise(
        id="reading-urban-2",
        skill="reading",
        category="Passage 1 • Urban Ecology",
        difficulty="Band 6.5 – 7.5",
        title_uz="🐭 Nyu-York sichqonlarining mutatsiyasi (Q2: T/F/NG)",
        title_en="🐭 NYC White-Footed Mice Adaptation (Q2: T/F/NG)",
        passage_text=URBAN_BIODIVERSITY_PASSAGE,
        prompt_uz="Matnga ko‘ra bayonot TRUE, FALSE yoki NOT GIVEN:\n«Metabolic mutations in New York City mice assist in metabolizing discarded human food.»",
        prompt_en="According to the passage, choose TRUE, FALSE or NOT GIVEN:\n«Metabolic mutations in New York City mice assist in metabolizing discarded human food.»",
        options=("TRUE", "FALSE", "NOT GIVEN"),
        answer_key="TRUE",
        explanation_uz="Matnda keltirilgan: ushbu fiziologik mutatsiyalar shahar sichqonlariga tashlandiq insoniy uglevodli ovqatlarni yallig'lanishsiz hazm qilishga yordam beradi.",
        explanation_en="Paragraph explicitly confirms mutations allow processing carbohydrate-dense anthropogenic food waste without exacerbating systemic inflammation.",
    ),
    "reading-urban-3": Exercise(
        id="reading-urban-3",
        skill="reading",
        category="Passage 1 • Avian Behavior",
        difficulty="Band 7.0 – 8.0",
        title_uz="🐦 Qora qushlarning erta tonggi sayrashi (Q3: Multi-Choice)",
        title_en="🐦 Blackbird Pre-Dawn Vocalization (Q3: Multi-Choice)",
        passage_text=URBAN_BIODIVERSITY_PASSAGE,
        prompt_uz=(
            "Ko'p variantli savol (Multiple Choice):\n"
            "«Why have European blackbirds shifted the timing of their vocalization to pre-dawn hours?»\n"
            "A) To attract female mates before foraging begins\n"
            "B) To avoid the acoustic interference created by morning vehicular traffic\n"
            "C) Because nighttime city lighting confuses their natural circadian rhythm\n"
            "D) To conserve metabolic energy during colder morning hours"
        ),
        prompt_en=(
            "Multiple Choice Question:\n"
            "«Why have European blackbirds shifted the timing of their vocalization to pre-dawn hours?»\n"
            "A) To attract female mates before foraging begins\n"
            "B) To avoid the acoustic interference created by morning vehicular traffic\n"
            "C) Because nighttime city lighting confuses their natural circadian rhythm\n"
            "D) To conserve metabolic energy during colder morning hours"
        ),
        options=("A", "B", "C", "D"),
        answer_key="B",
        explanation_uz="To'g'ri javob B: 3-xatboshida aytilganidek, qushlar erta tongga o'tish orqali ertalabki transport shovqini (acoustic interference) dan qochadi.",
        explanation_en="Correct answer is B: paragraph 3 confirms shifting to pre-dawn circumvent acoustic interference generated by morning traffic.",
    ),
    "reading-urban-4": Exercise(
        id="reading-urban-4",
        skill="reading",
        category="Passage 1 • Subterranean Speciation",
        difficulty="Band 7.0 – 8.5",
        title_uz="🚇 Metro bo'g'imoyoqlilari va reproduktiv izolyatsiya (Q4: T/F/NG)",
        title_en="🚇 Underground Arthropod Isolation (Q4: T/F/NG)",
        passage_text=URBAN_BIODIVERSITY_PASSAGE,
        prompt_uz="Matnga ko‘ra bayonot TRUE, FALSE yoki NOT GIVEN:\n«All arthropod populations in underground rail networks have completely lost the ability to fly.»",
        prompt_en="According to the passage, choose TRUE, FALSE or NOT GIVEN:\n«All arthropod populations in underground rail networks have completely lost the ability to fly.»",
        options=("TRUE", "FALSE", "NOT GIVEN"),
        answer_key="NOT GIVEN",
        explanation_uz="To'g'ri javob NOT GIVEN: Matnda ularning reproduktiv izolyatsiyada ekanligi ta'kidlangan, ammo ularning uchish qobiliyatini butunlay yo'qotganligi haqida ma'lumot berilmagan.",
        explanation_en="The text mentions reproductive isolation in subterranean transit networks, but never states that they lost the ability to fly.",
    ),

    # -------------------------------------------------------------------------
    # Reading Passage 2 & 3: Archaeology, Science & Neuroscience
    # -------------------------------------------------------------------------
    "reading-indus-1": Exercise(
        id="reading-indus-1",
        skill="reading",
        category="Passage 1 • Archaeology",
        difficulty="Band 6.5 – 7.5",
        title_uz="🏛 Hind sivilizatsiyasi muhandisligi (Passage 1)",
        title_en="🏛 Indus Valley Hydraulic Engineering (Passage 1)",
        passage_text=(
            "Excavations at Mohenjo-daro and Harappa revealed that the Indus civilization developed urban sanitary infrastructure "
            "unmatched in antiquity. Houses possessed private bathrooms draining into covered brick conduits along central streets, "
            "demonstrating an early realization of hydrological vector control centuries ahead of Mesopotamia."
        ),
        prompt_uz="Matnga ko‘ra bayonot TRUE, FALSE yoki NOT GIVEN:\n«Indus Valley settlements possessed enclosed municipal drainage systems along public thoroughfares.»",
        prompt_en="According to the passage, choose TRUE, FALSE or NOT GIVEN:\n«Indus Valley settlements possessed enclosed municipal drainage systems along public thoroughfares.»",
        options=("TRUE", "FALSE", "NOT GIVEN"),
        answer_key="TRUE",
        explanation_uz="Matnda aytilganidek, g'ishtli yopiq quvurlar (covered brick conduits) asosiy ko'chalar bo'ylab joylashtirilgan.",
        explanation_en="The text explicitly describes covered brick conduits running along central streets.",
    ),
    "reading-paper-1": Exercise(
        id="reading-paper-1",
        skill="reading",
        category="Passage 1 • Historical Chronology",
        difficulty="Band 6.5 – 7.5",
        title_uz="📜 Qog'oz ishlab chiqarish tarixi (Passage 1)",
        title_en="📜 Early Papermaking Transmission (Passage 1)",
        passage_text=(
            "Following the Battle of Talas in 751 AD, captured Chinese artisans transmitted the secrets of rag-based papermaking to Samarkand. "
            "Islamic scholars rapidly replaced perishable papyrus and costly parchment with smooth linen paper, which catalyzed the flourishing "
            "of libraries and scientific translation movements during the Golden Age."
        ),
        prompt_uz="Matnga ko‘ra bayonot TRUE, FALSE yoki NOT GIVEN:\n«The battle in Central Asia expedited the adoption of linen paper across Islamic scholarship centers.»",
        prompt_en="According to the passage, choose TRUE, FALSE or NOT GIVEN:\n«The battle in Central Asia expedited the adoption of linen paper across Islamic scholarship centers.»",
        options=("TRUE", "FALSE", "NOT GIVEN"),
        answer_key="TRUE",
        explanation_uz="Talas jangi tufayli qog'oz siri Samarqandga o'tib, butun Islom olamida keng tarqaldi.",
        explanation_en="The passage confirms the Battle of Talas catalyzed the flourishing of paper in Islamic libraries.",
    ),
    "reading-photo-1": Exercise(
        id="reading-photo-1",
        skill="reading",
        category="Passage 2 • Applied Science",
        difficulty="Band 7.0 – 8.5",
        title_uz="☀️ Sun'iy fotosintez va toza energiya (Passage 2)",
        title_en="☀️ Artificial Photosynthesis Engineering (Passage 2)",
        passage_text=(
            "Natural photosynthesis operates at an overall solar-to-biomass thermodynamic efficiency of merely one to two percent. "
            "By synthesizing molecular cobalt and nickel-based electrocatalysts, chemical engineers aim to decouple hydrogen splitting from biological limitations, "
            "achieving tenfold efficiency gains in converting ambient moisture directly into zero-emission liquid fuel."
        ),
        prompt_uz="Ko'p variantli savol (Multiple Choice):\n«What is the primary objective of synthetic electrocatalysts described in the text?»\nA) To accelerate agricultural crop growth\nB) To overcome natural thermodynamic limits in hydrogen fuel production\nC) To extract cobalt from deep seawater\nD) To filter toxic air pollutants",
        prompt_en="Multiple Choice Question:\n«What is the primary objective of synthetic electrocatalysts described in the text?»\nA) To accelerate agricultural crop growth\nB) To overcome natural thermodynamic limits in hydrogen fuel production\nC) To extract cobalt from deep seawater\nD) To filter toxic air pollutants",
        options=("A", "B", "C", "D"),
        answer_key="B",
        explanation_uz="To'g'ri javob B: biologik 1-2% cheklovni yengib, vodorod ajratish samaradorligini 10 barobar oshirish.",
        explanation_en="Correct answer is B: decoupling hydrogen splitting from natural thermodynamic limits.",
    ),
    "reading-fatigue-1": Exercise(
        id="reading-fatigue-1",
        skill="reading",
        category="Passage 2 • Cognitive Neuroscience",
        difficulty="Band 7.0 – 8.5",
        title_uz="🧠 Qaror qabul qilishda aqliy toliqish (Passage 2)",
        title_en="🧠 Cognitive Decision Fatigue (Passage 2)",
        passage_text=(
            "Ego depletion models suggest that self-regulation and analytical deliberation draw upon a finite reserve of mental energy. "
            "An influential study on judicial rulings revealed that favorable parole determinations plummeted from 65% early in the morning "
            "to nearly zero immediately preceding meal breaks, as mentally exhausted magistrates defaulted to the status quo option of denial."
        ),
        prompt_uz="Matnga ko‘ra bayonot TRUE, FALSE yoki NOT GIVEN:\n«Judges granted parole at higher rates right before their meal breaks compared to early mornings.»",
        prompt_en="According to the passage, choose TRUE, FALSE or NOT GIVEN:\n«Judges granted parole at higher rates right before their meal breaks compared to early mornings.»",
        options=("TRUE", "FALSE", "NOT GIVEN"),
        answer_key="FALSE",
        explanation_uz="Matnda aksincha keltirilgan: tushlikdan oldin ijobiy qarorlar 0% ga tushib ketgan, ertalab esa 65% bo'lgan.",
        explanation_en="Paragraph shows favorable rulings dropped to nearly zero before meals, refuting the statement.",
    ),
    "reading-memory-1": Exercise(
        id="reading-memory-1",
        skill="reading",
        category="Passage 3 • Neuroscience",
        difficulty="Band 7.5 – 9.0",
        title_uz="💤 Uyqu va xotira mustahkamlanishi (Passage 3)",
        title_en="💤 Sleep & Synaptic Memory Consolidation (Passage 3)",
        passage_text=(
            "During non-rapid eye movement slow-wave sleep, high-amplitude delta oscillations coordinate sharp-wave ripples between the hippocampus and neocortex. "
            "This active system consolidation protocol replays episodic traces encoded during waking states, gradually translocating ephemeral short-term storage "
            "into resilient long-term cortical networks."
        ),
        prompt_uz="Muallif fikriga ko‘ra YES, NO yoki NOT GIVEN:\n«Slow-wave sleep facilitates the transfer of episodic representations from temporary to permanent neural storage.»",
        prompt_en="According to the writer's claims, choose YES, NO or NOT GIVEN:\n«Slow-wave sleep facilitates the transfer of episodic representations from temporary to permanent neural storage.»",
        options=("YES", "NO", "NOT GIVEN"),
        answer_key="YES",
        explanation_uz="Muallif keltirishicha, slow-wave sleep paytida qisqa muddatli xotira uzoq muddatli kortikal tarmoqlarga o'tadi.",
        explanation_en="The text explicitly confirms translocating short-term episodic traces into long-term cortical storage.",
    ),

    # =========================================================================
    # 🎧 LISTENING MOCK TESTS (Cambridge Standard & Audio URLs)
    # =========================================================================
    "listening-student-housing-1": Exercise(
        id="listening-student-housing-1",
        skill="listening",
        category="Part 1 • Student Accommodation Inquiry",
        difficulty="Band 6.5 – 7.5",
        title_uz="🏡 Talabalar yotoqxonasi narxi (Part 1)",
        title_en="🏡 University Housing Inquiry (Part 1)",
        audio_url="https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
        passage_text=(
            "Accommodation Officer: 'Good morning! Student Accommodation Service, how can I assist you today?'\n"
            "Student: 'Hello, I would like to inquire about standard single rooms for the upcoming academic year.'\n"
            "Accommodation Officer: 'Certainly. The standard en-suite single room fee is fixed at £185 per week, "
            "which covers geothermal heating, water, and broadband internet.'\n"
            "Student: 'That sounds very reasonable. Is there a refundable deposit upon moving in?'\n"
            "Accommodation Officer: 'Yes, there is a £450 deposit required upon contract signature.'"
        ),
        prompt_uz="Audio trekni tinglang va savolga javob yozing (Faqat raqam yoki so'm/pound):\n«What is the weekly room fee in pounds for the standard unit?»",
        prompt_en="Listen to the audio track and answer the question (Number/Currency):\n«What is the weekly room fee in pounds for the standard unit?»",
        answer_key="185",
        acceptable_answers=("£185", "185 pounds", "185£"),
        explanation_uz="Mas'ul xodim aniq aytadi: «The standard en-suite single room fee is fixed at £185 per week».",
        explanation_en="The accommodation coordinator confirms the weekly fee is 185 pounds.",
    ),
    "listening-student-housing-2": Exercise(
        id="listening-student-housing-2",
        skill="listening",
        category="Part 1 • Accommodation Facilities",
        difficulty="Band 6.5 – 7.5",
        title_uz="🧺 Yotoqxona qulayliklari va to'lov (Part 1)",
        title_en="🧺 Housing Facilities Payment (Part 1)",
        audio_url="https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
        passage_text=(
            "Student: 'Are laundry facilities and washing machines included in the standard weekly fee?'\n"
            "Accommodation Officer: 'Heating and high-speed internet are fully complimentary, but our ground floor "
            "laundry machines operate via a separate contactless payment card.'"
        ),
        prompt_uz=(
            "Variantlardan birini tanlang (A, B, C yoki D):\n"
            "«Which facility requires a separate payment card?»\n"
            "A) High-speed broadband\n"
            "B) Central heating\n"
            "C) Ground floor laundry\n"
            "D) Hot water supply"
        ),
        prompt_en=(
            "Choose the correct option (A, B, C or D):\n"
            "«Which facility requires a separate payment card?»\n"
            "A) High-speed broadband\n"
            "B) Central heating\n"
            "C) Ground floor laundry\n"
            "D) Hot water supply"
        ),
        options=("A", "B", "C", "D"),
        answer_key="C",
        acceptable_answers=("Ground floor laundry", "laundry"),
        explanation_uz="Xodim tushuntiradi: kir yuvish mashinalari (ground floor laundry) uchun alohida karta talab qilinadi.",
        explanation_en="The coordinator states laundry machines operate via a separate card.",
    ),
    "listening-student-housing-3": Exercise(
        id="listening-student-housing-3",
        skill="listening",
        category="Part 1 • Arrival Protocol",
        difficulty="Band 6.5 – 7.5",
        title_uz="📅 Kelish va ro'yxatdan o'tish kuni (Part 1)",
        title_en="📅 Check-in Day Protocol (Part 1)",
        audio_url="https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3",
        passage_text=(
            "Student: 'When can I arrive to collect my apartment keys and complete formal verification?'\n"
            "Accommodation Officer: 'You must arrive on Friday before 5:00 PM to finalize documents and collect your key.'"
        ),
        prompt_uz="Hafta kunini yozing (1 ta so'z):\n«On which day of the week must the student complete arrival check-in?»",
        prompt_en="State the day of the week (1 word):\n«On which day of the week must the student complete arrival check-in?»",
        answer_key="Friday",
        acceptable_answers=("friday", "on friday"),
        explanation_uz="Koordinator aytadi: «You must arrive on Friday before 5:00 PM».",
        explanation_en="The coordinator specifies Friday before 5:00 PM.",
    ),

    # -------------------------------------------------------------------------
    # Cambridge Standard: Bicycle Rental & Tour Booking Form
    # -------------------------------------------------------------------------
    "listening-cambridge-bike-1": Exercise(
        id="listening-cambridge-bike-1",
        skill="listening",
        category="Part 1 • Cambridge Standard Note Completion",
        difficulty="Band 6.5 – 7.5",
        title_uz="🚲 Velosiped ijarasi: Mijoz familiyasi (Track 01)",
        title_en="🚲 Cambridge Bike Rental: Customer Surname (Track 01)",
        passage_text=(
            "CLERK: Good morning, Oldfield Heritage Leisure Center. How may I help you?\n"
            "CUSTOMER: Hello, I'd like to book bicycle rentals and a tour package.\n"
            "CLERK: Of course. Could I take your lead customer full surname, please?\n"
            "CUSTOMER: Yes, it's MacIntyre. M-A-C-I-N-T-Y-R-E."
        ),
        prompt_uz="Bo'sh joyni to'ldiring (Familiya):\n«Lead customer full surname: [___]»",
        prompt_en="Complete the note (Surname):\n«Lead customer full surname: [___]»",
        answer_key="MacIntyre",
        acceptable_answers=("macintyre", "Macintyre", "McIntyre"),
        explanation_uz="Mijoz o'z familiyasini aniq harflab aytadi: M-A-C-I-N-T-Y-R-E (MacIntyre).",
        explanation_en="The caller spells out the surname: MacIntyre.",
    ),
    "listening-cambridge-bike-2": Exercise(
        id="listening-cambridge-bike-2",
        skill="listening",
        category="Part 1 • Cambridge Standard Note Completion",
        difficulty="Band 6.5 – 7.5",
        title_uz="📞 Aloqa telefon raqami (Track 01)",
        title_en="📞 Emergency Contact Phone (Track 01)",
        passage_text=(
            "CLERK: Thank you Mr. MacIntyre. And an emergency mobile contact number?\n"
            "CUSTOMER: It's +44 (0) 7946 and then 382910."
        ),
        prompt_uz="Telefon raqamining davomini yozing (6 ta raqam):\n«Emergency contact number: +44 (0) 7946 [___]»",
        prompt_en="Enter the remainder of the telephone number:\n«Emergency contact number: +44 (0) 7946 [___]»",
        answer_key="382910",
        acceptable_answers=("382 910", "382-910"),
        explanation_uz="Telefon raqamining qolgan 6 ta raqami: 382910.",
        explanation_en="The remaining digits provided are 382910.",
    ),
    "listening-cambridge-bike-3": Exercise(
        id="listening-cambridge-bike-3",
        skill="listening",
        category="Part 1 • Cambridge Standard Note Completion",
        difficulty="Band 6.5 – 7.5",
        title_uz="🚴 Velosiped turi (Track 01)",
        title_en="🚴 Bicycle Type Requested (Track 01)",
        passage_text=(
            "CLERK: And which type of bicycle would you like to reserve for the tour?\n"
            "CUSTOMER: We would prefer a Tandem hybrid bike for two riders, if available."
        ),
        prompt_uz="Velosiped turini yozing (1-2 so'z):\n«Type of bicycle requested: [___]»",
        prompt_en="Specify type of bicycle requested:\n«Type of bicycle requested: [___]»",
        answer_key="Tandem hybrid",
        acceptable_answers=("tandem hybrid", "tandem", "hybrid"),
        explanation_uz="Mijoz so'ragan velosiped turi: Tandem hybrid.",
        explanation_en="Customer requested a Tandem hybrid bicycle.",
    ),
    "listening-cambridge-bike-4": Exercise(
        id="listening-cambridge-bike-4",
        skill="listening",
        category="Part 1 • Cambridge Standard Note Completion",
        difficulty="Band 6.5 – 7.5",
        title_uz="🎒 Xavfsizlik jihozi va sumka (Track 01)",
        title_en="🎒 Optional Safety Gear (Track 01)",
        passage_text=(
            "CLERK: Great. All rentals come with standard locks. Would you like optional safety gear?\n"
            "CUSTOMER: Yes, please include a child helmet and a waterproof pannier bag."
        ),
        prompt_uz="Jihoz nomini yozing (1-2 so'z):\n«Optional safety gear included: child helmet and [___]»",
        prompt_en="Complete note (1-2 words):\n«Optional safety gear included: child helmet and [___]»",
        answer_key="pannier bag",
        acceptable_answers=("pannier bag", "pannier", "panniers"),
        explanation_uz="Mijoz tanlagan jihoz: pannier bag (velosiped yuk xaltasi).",
        explanation_en="Customer requested a pannier bag.",
    ),
    "listening-cambridge-bike-5": Exercise(
        id="listening-cambridge-bike-5",
        skill="listening",
        category="Part 1 • Cambridge Standard Note Completion",
        difficulty="Band 6.5 – 7.5",
        title_uz="⚓ Velosipedni topshirish joyi (Track 01)",
        title_en="⚓ Designated Drop-off Point (Track 01)",
        passage_text=(
            "CLERK: Where do you plan to conclude your journey?\n"
            "CUSTOMER: We will return the bikes at the designated drop-off station near Old Lighthouse pier."
        ),
        prompt_uz="Joy nomini to'ldiring:\n«Designated drop-off point: Old [___]»",
        prompt_en="Enter location name:\n«Designated drop-off point: Old [___]»",
        answer_key="Lighthouse pier",
        acceptable_answers=("lighthouse pier", "lighthouse", "pier"),
        explanation_uz="Topshirish joyi: Old Lighthouse pier.",
        explanation_en="Drop-off point is Old Lighthouse pier.",
    ),

    # -------------------------------------------------------------------------
    # More Listening Exercises (Eco-housing & Lectures)
    # -------------------------------------------------------------------------
    "listening-eco-1": Exercise(
        id="listening-eco-1",
        skill="listening",
        category="Part 1 • Everyday Dialogue",
        difficulty="Band 6.5 – 7.5",
        title_uz="🏡 Yashil turar joy: Ko'chib o'tish sanasi (Part 1)",
        title_en="🏡 Eco-Housing Move-in Date (Part 1)",
        passage_text=(
            "Audio Transcript Excerpt:\n"
            "MARCUS: Good morning, Meadowlands Eco-Housing Community. Marcus speaking!\n"
            "SARAH: Hello Marcus! I'm calling about the Studio Plus apartments for autumn term. Could you confirm move-in dates?\n"
            "MARCUS: Our post-summer refurbishments conclude on the 18th of September, which is when new tenants can move in."
        ),
        prompt_uz="Audio qismini o'qing va savolga javob yozing (Maksimum 2 so'z yoki raqam):\n«What is the confirmed move-in date for new tenants?»",
        prompt_en="Read the audio excerpt and answer the question (No more than 2 words and/or a number):\n«What is the confirmed move-in date for new tenants?»",
        answer_key="18th September",
        acceptable_answers=("18 September", "September 18", "18th of September", "18th sept"),
        explanation_uz="Markus aytadi: «the 18th of September, which is when new tenants can move in».",
        explanation_en="Marcus explicitly confirms the move-in date: 18th September.",
    ),
    "listening-eco-2": Exercise(
        id="listening-eco-2",
        skill="listening",
        category="Part 1 • Everyday Dialogue",
        difficulty="Band 6.5 – 7.5",
        title_uz="💰 Haftalik ijara to'lovi (Part 1)",
        title_en="💰 Weekly Rent Specification (Part 1)",
        passage_text=(
            "Audio Transcript Excerpt:\n"
            "SARAH: And what is the weekly rental fee for the Studio Plus?\n"
            "MARCUS: The weekly rental fee for that unit is £185, which includes high-speed fiber internet and geothermal heating.\n"
            "SARAH: What about the refundable security deposit?\n"
            "MARCUS: The refundable deposit is £450 upon signing."
        ),
        prompt_uz="Savolga javob yozing (Raqam yoki valyuta):\n«How much is the weekly rent for the Studio Plus unit in pounds?»",
        prompt_en="Answer the question (Number):\n«How much is the weekly rent for the Studio Plus unit in pounds?»",
        answer_key="185",
        acceptable_answers=("£185", "185 pounds", "185£"),
        explanation_uz="Haftalik to'lov £185 ekanligi aytildi (£450 esa depozit).",
        explanation_en="Weekly rent is £185 (450 is the deposit).",
    ),
    "listening-solar-1": Exercise(
        id="listening-solar-1",
        skill="listening",
        category="Part 3 • Academic Tutorial",
        difficulty="Band 7.0 – 8.5",
        title_uz="🔬 Quyosh panellari ostidagi qishloq xo'jaligi (Part 3)",
        title_en="🔬 Agrivoltaics Dual-Use Land Research (Part 3)",
        passage_text=(
            "Audio Transcript Excerpt:\n"
            "PROFESSOR: Elena, what was the most remarkable experimental finding in your agrivoltaic field trials?\n"
            "ELENA: What surprised researchers most was the moisture retention in soil directly shaded by the photovoltaic arrays. "
            "Crop water demand dropped by nearly 30% compared to open-field crops."
        ),
        prompt_uz="Savolga javob bering (1-2 so'z):\n«What unexpected soil benefit was recorded under the solar panels?»",
        prompt_en="Answer the question (1-2 words):\n«What unexpected soil benefit was recorded under the solar panels?»",
        answer_key="moisture retention",
        acceptable_answers=("moisture", "retaining moisture", "soil moisture"),
        explanation_uz="Elena ta'kidlaydi: «What surprised researchers most was the moisture retention».",
        explanation_en="Elena notes the key unexpected benefit: moisture retention.",
    ),
    "listening-vents-1": Exercise(
        id="listening-vents-1",
        skill="listening",
        category="Part 4 • University Lecture",
        difficulty="Band 7.5 – 9.0",
        title_uz="🌋 Chuqur dengiz gidrotermal manbalari (Part 4)",
        title_en="🌋 Hydrothermal Vent Ecosystems Lecture (Part 4)",
        passage_text=(
            "Audio Transcript Excerpt:\n"
            "LECTURER: Deprived of solar photons, hydrothermal vent communities thrive via primary chemosynthesis. "
            "Symbiotic sulfur-oxidizing bacteria extract biochemical energy through the catalysis of dissolved hydrogen sulfide "
            "spewing from the Earth's oceanic mantle."
        ),
        prompt_uz="Savolga javob bering (1-2 so'z):\n«What chemical compound do deep-sea vent bacteria oxidize for energy?»",
        prompt_en="Answer the question (1-2 words):\n«What chemical compound do deep-sea vent bacteria oxidize for energy?»",
        answer_key="hydrogen sulfide",
        acceptable_answers=("hydrogen sulphide", "h2s", "sulfide"),
        explanation_uz="Ma'ruzachi aytadi: «catalysis of dissolved hydrogen sulfide».",
        explanation_en="Lecturer identifies hydrogen sulfide as the oxidized compound.",
    ),

    # =========================================================================
    # ✍️ WRITING MOCK TASKS (Band 7.5+ Blueprint & Model Answers)
    # =========================================================================
    "writing-ai-academic-1": Exercise(
        id="writing-ai-academic-1",
        skill="writing",
        category="Task 2 • Discussion & Opinion Essay",
        difficulty="Band 7.5+",
        title_uz="🎓 AI oliy ta'limda: Taqiqlashmi yoki integratsiya? (Task 2)",
        title_en="🎓 AI in Higher Education: Prohibition vs Integration (Task 2)",
        prompt_uz=(
            "IELTS Academic Writing Task 2 (Discussion & Opinion):\n\n"
            "«Some people believe that artificial intelligence tools should be banned in universities because they "
            "encourage academic dishonesty. Others argue that AI should be integrated into teaching.\n\n"
            "Discuss both views and give your own opinion.»\n\n"
            "📌 Talablar: Kamida 250 so'z yozing. Fikringizni aniq asoslab bering."
        ),
        prompt_en=(
            "IELTS Academic Writing Task 2 (Discussion & Opinion):\n\n"
            "«Some people believe that artificial intelligence tools should be banned in universities because they "
            "encourage academic dishonesty. Others argue that AI should be integrated into teaching.\n\n"
            "Discuss both views and give your own opinion.»\n\n"
            "📌 Requirements: Write at least 250 words with logical paragraphing and balanced reasoning."
        ),
        model_answer=(
            "The rapid proliferation of artificial intelligence has sparked intense debate regarding its role in tertiary education. "
            "While sceptics contend that AI facilitates plagiarism, I firmly argue that prohibiting such software is both impractical "
            "and counterproductive, and that universities should instead cultivate disciplined digital literacy.\n\n"
            "Opponents of generative AI highlight legitimate concerns about academic dishonesty. When undergraduates employ automated "
            "chatbots to produce essays or solve complex computational problems, the cognitive rigor traditionally demanded by independent "
            "inquiry is severely undermined. Over-reliance on algorithmic outputs may erode foundational research capabilities and critical "
            "thinking, producing graduates who lack autonomous problem-solving aptitudes.\n\n"
            "Nevertheless, blanket bans on ubiquitous technologies are virtually impossible to enforce and overlook immense pedagogical "
            "opportunities. When deliberately incorporated into curricula, AI functions as a 24/7 personalized tutor, offering instantaneous "
            "feedback, debugging syntax, and translating dense scholarly articles. Furthermore, modern industries increasingly mandate AI "
            "proficiency; thus, shielding students from algorithmic workflows leaves them ill-prepared for competitive labor markets.\n\n"
            "In conclusion, while ethical safeguards and clear citation standards are imperative, academic institutions must embrace AI as an "
            "assistive instrument rather than treating it as a threat to scholarly integrity."
        ),
    ),
    "writing-renewable-energy-1": Exercise(
        id="writing-renewable-energy-1",
        skill="writing",
        category="Task 1 • Academic Data Report",
        difficulty="Band 7.5+",
        title_uz="⚡ Yevropada qayta tiklanuvchi energiya dinamikasi (Task 1)",
        title_en="⚡ Renewable Energy Adoption in Europe (Task 1 Report)",
        prompt_uz=(
            "IELTS Academic Writing Task 1 (Data Visual Report):\n\n"
            "«The chart illustrates the percentage of national electricity generated by renewable resources "
            "(solar, wind, and hydroelectric) in Germany, Spain, Sweden, and Italy between 2010 and 2025.»\n\n"
            "📌 Asosiy xususiyatlarni tanlang, umumlashtiring va taqqoslang. Kamida 150 so‘z yozing."
        ),
        prompt_en=(
            "IELTS Academic Writing Task 1 (Data Visual Report):\n\n"
            "«The chart illustrates the percentage of national electricity generated by renewable resources "
            "(solar, wind, and hydroelectric) in Germany, Spain, Sweden, and Italy between 2010 and 2025.»\n\n"
            "📌 Summarize the information by reporting main trends and comparisons. Write at least 150 words."
        ),
        model_answer=(
            "The chart outlines the proportion of electricity derived from renewable power—namely solar, wind, and hydro—across four European nations "
            "over a fifteen-year timeframe starting in 2010.\n\n"
            "Overall, all four countries exhibited notable upward trajectories in their clean power generation, with Sweden consistently maintaining "
            "the dominant share throughout the surveyed period, while Italy recorded the most modest absolute increase.\n\n"
            "In 2010, Sweden generated approximately 48% of its electricity through renewables, steadily climbing to surpass 65% by 2025. Germany "
            "demonstrated an even steeper growth rate, rising from 17% in 2010 to nearly 52% in 2025, driven heavily by nationwide offshore wind investments.\n\n"
            "Conversely, Spain and Italy commenced at roughly comparable baselines of 24% and 21% respectively. While Spain progressed robustly to reach "
            "44% by 2025 via expansive photovoltaic installations, Italy expanded more moderately, peaking at just 33% at the close of the period."
        ),
    ),
    "writing-tech-job-1": Exercise(
        id="writing-tech-job-1",
        skill="writing",
        category="Task 2 • Opinion Essay",
        difficulty="Band 7.0 – 8.5",
        title_uz="💡 AI va ish o'rinlari kelajagi (Task 2)",
        title_en="💡 Artificial Intelligence & Employment (Task 2)",
        prompt_uz=(
            "IELTS Academic Writing Task 2 (Opinion Essay):\n\n"
            "«Some economists assert that artificial intelligence will eliminate millions of traditional jobs, causing widespread social unrest, "
            "while others argue that it will create brand-new industries and enhance productivity.»\n\n"
            "To what extent do you agree or disagree? Give reasons and examples. Kamida 250 so‘z yozing."
        ),
        prompt_en=(
            "IELTS Academic Writing Task 2 (Opinion Essay):\n\n"
            "«Some economists assert that artificial intelligence will eliminate millions of traditional jobs, causing widespread social unrest, "
            "while others argue that it will create brand-new industries and enhance productivity.»\n\n"
            "To what extent do you agree or disagree? Give reasons and examples. Write at least 250 words."
        ),
    ),
    "writing-remote-1": Exercise(
        id="writing-remote-1",
        skill="writing",
        category="Task 2 • Discussion Essay",
        difficulty="Band 6.5 – 7.5",
        title_uz="🏠 Masofadan ishlashning afzallik va kamchiliklari (Task 2)",
        title_en="🏠 Remote Work Advantages vs Disadvantages (Task 2)",
        prompt_uz=(
            "IELTS Academic Writing Task 2 (Discussion):\n\n"
            "«Nowadays, an increasing number of organizations allow their staff to work entirely from home. "
            "Do the advantages of this trend outweigh the disadvantages for employers and employees?»\n\n"
            "O'z nuqtai nazaringizni asoslang. Kamida 250 so‘z yozing."
        ),
        prompt_en=(
            "IELTS Academic Writing Task 2 (Discussion):\n\n"
            "«Nowadays, an increasing number of organizations allow their staff to work entirely from home. "
            "Do the advantages of this trend outweigh the disadvantages for employers and employees?»\n\n"
            "Discuss both sides and give your opinion. Write at least 250 words."
        ),
    ),
    "writing-urban-transport-1": Exercise(
        id="writing-urban-transport-1",
        skill="writing",
        category="Task 1 • Academic Report",
        difficulty="Band 6.5 – 8.0",
        title_uz="📊 Shahar transporti tahlili (Task 1 Report)",
        title_en="📊 Urban Commute Modes 2015-2025 (Task 1 Report)",
        prompt_uz=(
            "IELTS Academic Writing Task 1 (Data Report):\n\n"
            "«The line chart illustrates the percentage of daily commuters using private cars, metro systems, and bicycles in five major metropolitan hubs from 2015 to 2025.»\n\n"
            "Asosiy xususiyatlarni umumlashtiring va taqqoslang. Kamida 150 so‘z yozing."
        ),
        prompt_en=(
            "IELTS Academic Writing Task 1 (Data Report):\n\n"
            "«The line chart illustrates the percentage of daily commuters using private cars, metro systems, and bicycles in five major metropolitan hubs from 2015 to 2025.»\n\n"
            "Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words."
        ),
    ),

    # =========================================================================
    # 🎙 SPEAKING MOCK TOPICS (Parts 1, 2, 3 with Sample Model Answers)
    # =========================================================================
    "speaking-academic-major-1": Exercise(
        id="speaking-academic-major-1",
        skill="speaking",
        category="Part 1 • Work & Daily Studies",
        difficulty="Band 6.5 – 7.5",
        title_uz="🎓 Mutaxassislik va o'qish tartibi (Part 1)",
        title_en="🎓 Field of Study & Daily Routine (Part 1)",
        prompt_uz=(
            "Ingliz tilida gapirib bering (Ovozli xabar yoki matn):\n"
            "«What subjects are you studying and why did you choose that field? "
            "Do you prefer to study in the morning or late at night?»"
        ),
        prompt_en=(
            "Answer in English (Voice message or text):\n"
            "«What subjects are you studying and why did you choose that field? "
            "Do you prefer to study in the morning or late at night?»"
        ),
        model_answer=(
            "At present, I am an undergraduate student majoring in computer science and artificial intelligence. "
            "I chose this academic path because computing empowers individuals to formulate tangible solutions to complex "
            "societal problems. Regarding my study habits, I substantially prefer pre-dawn hours because the absolute absence "
            "of digital notifications and ambient noise enables uninterrupted deep focus."
        ),
    ),
    "speaking-work-study-1": Exercise(
        id="speaking-work-study-1",
        skill="speaking",
        category="Part 1 • Work & Studies",
        difficulty="Band 6.0 – 7.5",
        title_uz="💼 Ish yoki talabalik faoliyati (Part 1)",
        title_en="💼 Work and Studies Overview (Part 1)",
        prompt_uz="Ingliz tilida gapirib bering:\n«Do you work or are you a student? What specific subjects or responsibilities do you focus on each day?»",
        prompt_en="Answer in English:\n«Do you work or are you a student? What specific subjects or responsibilities do you focus on each day?»",
    ),
    "speaking-city-1": Exercise(
        id="speaking-city-1",
        skill="speaking",
        category="Part 1 • Hometown & Environment",
        difficulty="Band 6.0 – 7.5",
        title_uz="🏙 Shahringiz va zamonaviy o'zgarishlar (Part 1)",
        title_en="🏙 Hometown & Urban Development (Part 1)",
        prompt_uz="Ingliz tilida gapirib bering:\n«What do you like most about your hometown, and how has technology or infrastructure changed it over recent years?»",
        prompt_en="Answer in English:\n«What do you like most about your hometown, and how has technology or infrastructure changed it over recent years?»",
    ),
    "speaking-digital-habits-1": Exercise(
        id="speaking-digital-habits-1",
        skill="speaking",
        category="Part 1 • Communication Habits",
        difficulty="Band 6.5 – 7.5",
        title_uz="📱 Onlayn muloqot va jonli uchrashuvlar (Part 1)",
        title_en="📱 Digital Communication Habits (Part 1)",
        prompt_uz="Ingliz tilida gapirib bering:\n«How much time do you spend communicating online through messages compared to meeting people face-to-face?»",
        prompt_en="Answer in English:\n«How much time do you spend communicating online through messages compared to meeting people face-to-face?»",
        model_answer=(
            "Inevitably, the majority of my day-to-day coordination takes place via digital messaging applications due to academic "
            "and professional convenience. However, I make a deliberate effort to reserve weekends for authentic face-to-face interactions, "
            "as non-verbal nuances and emotional warmth cannot be replicated through screens."
        ),
    ),
    "speaking-ai-transformation-cue-card": Exercise(
        id="speaking-ai-transformation-cue-card",
        skill="speaking",
        category="Part 2 • Candidate Task Card (2 daqiqalik nutq)",
        difficulty="Band 7.5 – 8.5",
        title_uz="📇 Ta'limni o'zgartirgan AI texnologiyasi (Part 2 Cue Card)",
        title_en="📇 Inspiring AI Innovation Cue Card (Part 2)",
        prompt_uz=(
            "IELTS Speaking Part 2 (Candidate Cue Card):\n\n"
            "Describe an artificial intelligence tool or software that has transformed the way you study or work.\n\n"
            "You should say:\n"
            "• What this tool is and when you discovered it\n"
            "• What specific tasks it helps you perform\n"
            "• What advantages it provides over traditional methods\n"
            "• And explain why you consider this innovation impactful for future learners."
        ),
        prompt_en=(
            "IELTS Speaking Part 2 (Candidate Cue Card):\n\n"
            "Describe an artificial intelligence tool or software that has transformed the way you study or work.\n\n"
            "You should say:\n"
            "• What this tool is and when you discovered it\n"
            "• What specific tasks it helps you perform\n"
            "• What advantages it provides over traditional methods\n"
            "• And explain why you consider this innovation impactful for future learners."
        ),
        model_answer=(
            "I would like to speak about generative AI language models, which I first encountered approximately two years ago. "
            "As an ambitious IELTS candidate, this tool fundamentally revolutionized my preparation methodology. It acts as an accessible, "
            "tireless 24/7 personalized examiner, evaluating my writing essays against Cambridge band descriptors and providing immediate "
            "lexical collocations.\n\n"
            "The most salient advantage over traditional textbooks is adaptive personalization. Instead of passive reading, I engage in interactive "
            "conversational drills, receiving diagnostic error corrections in real time. Ultimately, I believe democratized AI will equalize educational "
            "access worldwide, granting students in underserved regions the same high-caliber coaching previously reserved for private academies."
        ),
    ),
    "speaking-ai-ethics-future-part3": Exercise(
        id="speaking-ai-ethics-future-part3",
        skill="speaking",
        category="Part 3 • Analytical Discussion",
        difficulty="Band 7.5 – 9.0",
        title_uz="🌐 AI va insoniy o'qituvchilar taqqosi (Part 3)",
        title_en="🌐 AI vs Human Educators & Ethics (Part 3 Discussion)",
        prompt_uz=(
            "Ingliz tilida chuqur tahliliy javob bering:\n"
            "«Do you believe artificial intelligence will ever entirely replace human teachers, "
            "and what ethical safeguards should governments introduce regarding automated testing?»"
        ),
        prompt_en=(
            "Provide an in-depth analytical response in English:\n"
            "«Do you believe artificial intelligence will ever entirely replace human teachers, "
            "and what ethical safeguards should governments introduce regarding automated testing?»"
        ),
        model_answer=(
            "In my perspective, artificial intelligence will undoubtedly augment pedagogy, but it will never entirely replace human educators. "
            "While algorithms excel at data-driven personalized assessments and repetitive instruction, human mentors provide irreplaceable qualities: "
            "empathy, moral guidance, and inspiring emotional encouragement during adversity.\n\n"
            "Regarding automated testing, regulatory bodies must mandate absolute algorithmic transparency. Clear audit standards must be instituted "
            "to prevent demographic training biases, ensuring scoring models remain impartial and equitable for candidates from all linguistic backgrounds."
        ),
    ),
    "speaking-critical-thinking-part3": Exercise(
        id="speaking-critical-thinking-part3",
        skill="speaking",
        category="Part 3 • Analytical Discussion",
        difficulty="Band 7.5 – 9.0",
        title_uz="🧠 Algoritmlar va tanqidiy fikrlash (Part 3)",
        title_en="🧠 Algorithmic Reliance & Critical Thinking (Part 3)",
        prompt_uz=(
            "Ingliz tilida tahliliy javob bering:\n"
            "«Some educators worry that students might lose critical thinking skills if they rely too heavily on automated AI tools. "
            "What is your view on this concern?»"
        ),
        prompt_en=(
            "Provide an analytical answer in English:\n"
            "«Some educators worry that students might lose critical thinking skills if they rely too heavily on automated AI tools. "
            "What is your view on this concern?»"
        ),
        model_answer=(
            "That concern is entirely justified if students treat AI merely as a shortcut for generating ready-made answers. "
            "True learning requires cognitive friction—struggling with concepts and testing hypotheses. However, when educators design assignments "
            "that require students to critique, verify, and debate AI outputs, it actually elevates critical scrutiny to higher Bloom taxonomy levels."
        ),
    ),
}


def get_exercises_by_skill(skill: str) -> list[Exercise]:
    return [ex for ex in EXERCISES.values() if ex.skill == skill]


def get_vocab_items() -> list[VocabItem]:
    return VOCAB_VAULT_ITEMS
