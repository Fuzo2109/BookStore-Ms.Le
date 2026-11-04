-- =====================================================================
-- Sample data: 8 categories, 26 authors, 36 books (NFR: ≥ 30 sample books).
-- Prices in VND. Covers are empty on purpose: books without a cover show the
-- default image (CR-04 AC5); upload real covers from the admin page.
-- Safe to re-run: existing names are skipped.
-- =====================================================================

insert into public.categories (name) values
  ('Fiction'), ('Classics'), ('Science Fiction & Fantasy'), ('Mystery & Thriller'),
  ('Business & Economics'), ('Self-Help'), ('Science & Technology'), ('Children''s Books')
on conflict (name) do nothing;

insert into public.authors (name) values
  ('Harper Lee'), ('George Orwell'), ('Jane Austen'), ('F. Scott Fitzgerald'),
  ('J.R.R. Tolkien'), ('Frank Herbert'), ('Isaac Asimov'), ('Ursula K. Le Guin'),
  ('Agatha Christie'), ('Arthur Conan Doyle'), ('Dan Brown'), ('Paulo Coelho'),
  ('Haruki Murakami'), ('Nguyen Nhat Anh'), ('Yuval Noah Harari'), ('Stephen Hawking'),
  ('Carl Sagan'), ('Daniel Kahneman'), ('James Clear'), ('Dale Carnegie'),
  ('Robert T. Kiyosaki'), ('Eric Ries'), ('Antoine de Saint-Exupery'), ('Roald Dahl'),
  ('Mary Shelley'), ('Leo Tolstoy')
on conflict (name) do nothing;

with seed (title, author, category, price, stock, description, days_ago) as (
  values
  ('To Kill a Mockingbird', 'Harper Lee', 'Classics', 135000, 12, 'A story of racial injustice and childhood innocence in the American South.', 1),
  ('Nineteen Eighty-Four', 'George Orwell', 'Classics', 120000, 20, 'A dystopian novel about surveillance, truth and totalitarian power.', 2),
  ('Animal Farm', 'George Orwell', 'Classics', 79000, 25, 'A short allegorical fable about revolution and power.', 3),
  ('Pride and Prejudice', 'Jane Austen', 'Classics', 99000, 15, 'Elizabeth Bennet and Mr Darcy in a comedy of manners.', 4),
  ('Emma', 'Jane Austen', 'Classics', 105000, 8, 'A well-meaning matchmaker learns about herself.', 5),
  ('The Great Gatsby', 'F. Scott Fitzgerald', 'Classics', 89000, 18, 'Wealth, love and illusion in the Jazz Age.', 6),
  ('The Hobbit', 'J.R.R. Tolkien', 'Science Fiction & Fantasy', 150000, 14, 'Bilbo Baggins sets out on an unexpected journey.', 7),
  ('The Fellowship of the Ring', 'J.R.R. Tolkien', 'Science Fiction & Fantasy', 195000, 10, 'The first part of The Lord of the Rings.', 8),
  ('Dune', 'Frank Herbert', 'Science Fiction & Fantasy', 210000, 9, 'Politics, religion and ecology on the desert planet Arrakis.', 9),
  ('Foundation', 'Isaac Asimov', 'Science Fiction & Fantasy', 145000, 11, 'A mathematician plans to shorten a galactic dark age.', 10),
  ('I, Robot', 'Isaac Asimov', 'Science Fiction & Fantasy', 115000, 7, 'Linked stories built on the Three Laws of Robotics.', 11),
  ('A Wizard of Earthsea', 'Ursula K. Le Guin', 'Science Fiction & Fantasy', 125000, 6, 'A young wizard must face the shadow he released.', 12),
  ('Frankenstein', 'Mary Shelley', 'Science Fiction & Fantasy', 85000, 13, 'A scientist creates life and must live with the consequences.', 13),
  ('Murder on the Orient Express', 'Agatha Christie', 'Mystery & Thriller', 110000, 16, 'Hercule Poirot investigates a murder on a snowbound train.', 14),
  ('And Then There Were None', 'Agatha Christie', 'Mystery & Thriller', 105000, 12, 'Ten strangers on an island, one by one.', 15),
  ('The Hound of the Baskervilles', 'Arthur Conan Doyle', 'Mystery & Thriller', 95000, 10, 'Sherlock Holmes and a legendary spectral hound.', 16),
  ('The Da Vinci Code', 'Dan Brown', 'Mystery & Thriller', 165000, 0, 'A symbologist follows clues hidden in famous artworks.', 17),
  ('The Alchemist', 'Paulo Coelho', 'Fiction', 89000, 30, 'A shepherd travels in search of his personal legend.', 18),
  ('Norwegian Wood', 'Haruki Murakami', 'Fiction', 140000, 9, 'Love, loss and memory in 1960s Tokyo.', 19),
  ('Kafka on the Shore', 'Haruki Murakami', 'Fiction', 175000, 5, 'Two intertwined journeys between dream and reality.', 20),
  ('Toi Thay Hoa Vang Tren Co Xanh', 'Nguyen Nhat Anh', 'Fiction', 125000, 40, 'A nostalgic story of childhood in a Vietnamese village.', 21),
  ('Cho Toi Xin Mot Ve Di Tuoi Tho', 'Nguyen Nhat Anh', 'Fiction', 80000, 35, 'A look back at childhood through the eyes of an adult.', 22),
  ('War and Peace', 'Leo Tolstoy', 'Classics', 320000, 4, 'Five families during the Napoleonic invasion of Russia.', 23),
  ('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'Science & Technology', 249000, 17, 'How Homo sapiens came to dominate the planet.', 24),
  ('Homo Deus', 'Yuval Noah Harari', 'Science & Technology', 259000, 8, 'What might the future hold for humankind?', 25),
  ('A Brief History of Time', 'Stephen Hawking', 'Science & Technology', 150000, 12, 'From the Big Bang to black holes, for general readers.', 26),
  ('Cosmos', 'Carl Sagan', 'Science & Technology', 199000, 6, 'A personal voyage through the universe and science.', 27),
  ('Thinking, Fast and Slow', 'Daniel Kahneman', 'Business & Economics', 229000, 10, 'The two systems that drive the way we think.', 28),
  ('The Lean Startup', 'Eric Ries', 'Business & Economics', 179000, 9, 'Build, measure, learn: a method for new products.', 29),
  ('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 'Business & Economics', 115000, 22, 'Lessons about money that schools do not teach.', 30),
  ('Atomic Habits', 'James Clear', 'Self-Help', 189000, 28, 'Tiny changes that produce remarkable results.', 31),
  ('How to Win Friends and Influence People', 'Dale Carnegie', 'Self-Help', 99000, 24, 'Timeless principles for dealing with people.', 32),
  ('The Little Prince', 'Antoine de Saint-Exupery', 'Children''s Books', 69000, 30, 'A pilot meets a little prince from another planet.', 33),
  ('Matilda', 'Roald Dahl', 'Children''s Books', 95000, 15, 'A brilliant girl stands up to the grown-ups.', 34),
  ('Charlie and the Chocolate Factory', 'Roald Dahl', 'Children''s Books', 95000, 18, 'A golden ticket to Willy Wonka''s factory.', 35),
  ('The BFG', 'Roald Dahl', 'Children''s Books', 89000, 0, 'Sophie and the Big Friendly Giant.', 36)
)
insert into public.books (title, author_id, category_id, price, stock, description, created_at, updated_at)
select s.title, a.id, c.id, s.price, s.stock, s.description,
       now() - make_interval(days => s.days_ago), now() - make_interval(days => s.days_ago)
from seed s
join public.authors a    on a.name = s.author
join public.categories c on c.name = s.category
where not exists (select 1 from public.books b where b.title = s.title);

-- ---------------------------------------------------------------------
-- Fuller book descriptions (original overviews written for this project, 04/11/2026).
-- Only replaces descriptions that the team has not already edited by hand
-- (hand-edited ones start with "Overview"). Safe to re-run.
update public.books b
set description = v.description
from (values
  ('To Kill a Mockingbird', 'In 1930s Alabama, young Scout Finch and her brother Jem watch their father, lawyer Atticus Finch, defend a Black man falsely accused of a crime. Through Scout''s eyes, the novel explores prejudice, courage and growing up in a small Southern town. A modern classic about justice and empathy.'),
  ('Nineteen Eighty-Four', 'In the superstate of Oceania, Party member Winston Smith rewrites history for the Ministry of Truth while telescreens watch his every move. When he begins a forbidden diary and a secret love affair, he discovers how far a regime will go to control not only what people do, but what they are able to think. A defining novel about surveillance, propaganda and the value of truth.'),
  ('The Fellowship of the Ring', 'The first volume of The Lord of the Rings. The quiet hobbit Frodo Baggins inherits a plain gold ring that turns out to be the One Ring of the Dark Lord Sauron. To keep it from its maker, Frodo leaves the Shire and joins a fellowship of hobbits, men, an elf, a dwarf and the wizard Gandalf on a perilous road toward Mordor.'),
  ('The Great Gatsby', 'Nick Carraway moves to Long Island in the summer of 1922 and is drawn into the glittering parties of his mysterious neighbour, Jay Gatsby. Behind the champagne lies Gatsby''s single-minded hope of winning back Daisy Buchanan, the woman he lost years before. A short, luminous novel about wealth, longing and the limits of the American Dream.'),
  ('The BFG', 'Late one night, orphan Sophie spots a giant creeping through the streets and is whisked away to Giant Country. Luckily he is the Big Friendly Giant, who catches good dreams instead of eating children. Together they hatch a daring plan to stop the other, far less friendly giants. Funny, warm and full of wonderfully invented words.'),
  ('Kafka on the Shore', 'Fifteen-year-old Kafka Tamura runs away from home and finds refuge in a quiet private library. Meanwhile Nakata, an elderly man who can talk to cats, sets out on a strange journey of his own. Their paths draw slowly toward each other in a dreamlike story of fate, memory and identity, told with Murakami''s mix of the everyday and the uncanny.'),
  ('A Wizard of Earthsea', 'On the island of Gont, a gifted boy named Ged is sent to the school for wizards on Roke. Proud and impatient, he tries a forbidden spell and unleashes a shadow that hunts him across the archipelago. To survive, he must stop running and face what he has set loose. A classic of fantasy about power, balance and self-knowledge.'),
  ('Cho Toi Xin Mot Ve Di Tuoi Tho', 'An adult narrator looks back on the year he was eight, when he and his friends questioned every rule the grown-ups made and invented their own small rebellions. Told with humour and gentle nostalgia, Nguyen Nhat Anh''s award-winning novel invites readers of every age to buy one more ticket back to childhood.'),
  ('The Little Prince', 'A pilot stranded in the Sahara meets a small boy who has travelled from a tiny asteroid, where he left behind a single, much-loved rose. Through the prince''s stories of the odd grown-ups he met on other planets, this beloved fable reflects on friendship, love and seeing what is invisible to the eye. Illustrated with the author''s own watercolours.'),
  ('Dune', 'On the desert planet Arrakis, the only source of the most valuable substance in the universe, young Paul Atreides and his family are caught in a deadly struggle between noble houses. Betrayed and hunted, Paul finds shelter among the desert Fremen and a destiny larger than himself. An epic of politics, religion and ecology that reshaped science fiction.'),
  ('Murder on the Orient Express', 'Snow stops the Orient Express in the middle of the night, and by morning a wealthy passenger lies dead in his locked compartment. Detective Hercule Poirot happens to be on board. With every passenger a suspect and every alibi apparently solid, he must find the truth before the line is cleared. One of Agatha Christie''s most famous puzzles.'),
  ('Atomic Habits', 'James Clear explains why small improvements, repeated every day, add up to remarkable results. Drawing on psychology and real examples, he shows how to make good habits obvious, attractive, easy and satisfying, and how to make bad ones harder to repeat. A practical guide to building systems rather than relying on willpower.'),
  ('Thinking, Fast and Slow', 'Nobel laureate Daniel Kahneman describes two ways of thinking: a fast, intuitive System 1 and a slower, deliberate System 2. He shows how their interplay shapes our judgements, from money decisions to first impressions, and where our intuitions mislead us. An accessible tour of decades of research on bias, risk and choice.'),
  ('The Da Vinci Code', 'Harvard symbologist Robert Langdon is called to the Louvre after the curator is found murdered, surrounded by cryptic symbols. With cryptologist Sophie Neveu he follows a trail of clues hidden in famous works of art across Paris and London, pursued by police and a secretive organisation. A fast-paced thriller of codes, conspiracies and history.'),
  ('The Alchemist', 'Santiago, a young Andalusian shepherd, dreams of treasure buried near the Egyptian pyramids and sets out to find it. On the way he meets a king, a crystal merchant, an Englishman and an alchemist, each teaching him to listen to his heart and read the signs around him. A short, inspiring fable about following one''s personal legend.'),
  ('Homo Deus', 'Having told the story of how humans came to rule the planet in Sapiens, Yuval Noah Harari turns to the future. As famine, plague and war recede, he asks what humanity will pursue next, and how data, algorithms and biotechnology might change what it means to be human. A provocative look at the possible paths ahead.'),
  ('Toi Thay Hoa Vang Tren Co Xanh', 'In a poor village in central Vietnam during the 1980s, young Thieu and his gentle younger brother Tuong share games, secrets and their first feelings of love and jealousy. Nguyen Nhat Anh captures the beauty and the small cruelties of childhood in a moving story later adapted into a popular film.'),
  ('Rich Dad Poor Dad', 'Robert Kiyosaki contrasts the money lessons he learned from two father figures: his highly educated but struggling father and his best friend''s entrepreneurial father. Through their stories he explains the difference between assets and liabilities and why financial literacy matters. A popular introduction to thinking about money, work and investing.'),
  ('Norwegian Wood', 'Hearing a Beatles song on a plane, Toru Watanabe is carried back to his student days in late-1960s Tokyo. He remembers Naoko, the fragile girlfriend of his late best friend, and Midori, lively and outspoken, as he tries to grow up amid loss and political upheaval. Murakami''s most realistic novel, about love, grief and memory.'),
  ('A Brief History of Time', 'Stephen Hawking explains the biggest questions in cosmology for readers without a science background: how the universe began, what black holes are, and whether time could ever run backwards. Moving from Newton and Einstein to quantum theory, it remains one of the most widely read introductions to modern physics.'),
  ('The Lean Startup', 'Eric Ries argues that most new ventures fail not for lack of effort but because they build things nobody needs. He presents a method of building a minimum viable product, measuring how customers respond and learning quickly whether to persevere or pivot. Practical advice for founders and for innovation teams inside larger companies.'),
  ('Charlie and the Chocolate Factory', 'Charlie Bucket''s family is so poor they live on cabbage soup, yet he dreams of Willy Wonka''s mysterious chocolate factory. When Charlie finds one of five golden tickets, he joins four badly behaved children on a tour full of chocolate rivers, Oompa-Loompas and wild inventions. A joyful, mischievous children''s classic.'),
  ('And Then There Were None', 'Ten strangers receive invitations to a mansion on an isolated island off the Devon coast. At dinner, a recorded voice accuses each of them of a past crime, and one by one the guests begin to die, just as an old nursery rhyme predicts. Cut off from the mainland, the survivors realise the killer must be among them. Christie''s best-selling mystery.'),
  ('Animal Farm', 'Tired of their drunken farmer, the animals of Manor Farm rebel and run the farm themselves under the motto that all animals are equal. Slowly the pigs take more power, rewrite the rules and become what they once overthrew. George Orwell''s short, sharp fable is a timeless warning about how revolutions can be betrayed.'),
  ('Frankenstein', 'Victor Frankenstein, a gifted young scientist, discovers how to give life to dead matter and builds a creature, only to abandon it in horror. Rejected by everyone it meets, the intelligent creature turns its loneliness into revenge on its maker. Often called the first science-fiction novel, it explores ambition, responsibility and what makes us human.'),
  ('Foundation', 'Mathematician Hari Seldon uses psychohistory to predict that the Galactic Empire will fall and be followed by thirty thousand years of darkness. To shorten that dark age to a single millennium, he founds a colony of scholars at the edge of the galaxy. Spanning generations, Asimov''s classic follows the crises that test Seldon''s plan.'),
  ('War and Peace', 'Set during Napoleon''s invasion of Russia, Tolstoy''s masterpiece follows the aristocratic Bezukhov, Bolkonsky and Rostov families through love, war, loss and renewal. Battlefield scenes stand beside ballrooms and country estates as characters search for meaning in a changing world. One of the great novels of world literature.'),
  ('Sapiens: A Brief History of Humankind', 'How did an unremarkable ape become the ruler of the planet? Yuval Noah Harari traces our species from the Cognitive Revolution through the rise of farming, money, empires and science, showing how shared stories allow millions of strangers to cooperate. A lively, thought-provoking overview of human history.'),
  ('Emma', 'Handsome, clever and rich, Emma Woodhouse is sure she knows best when it comes to other people''s love lives. Her matchmaking in the village of Highbury goes repeatedly wrong, teaching her some uncomfortable lessons about herself and about the man who has always told her the truth. Jane Austen''s sparkling comedy of manners.'),
  ('The Hobbit', 'Bilbo Baggins enjoys a comfortable life in his hobbit-hole until the wizard Gandalf and thirteen dwarves arrive at his door. Swept into their quest to reclaim a treasure guarded by the dragon Smaug, Bilbo faces trolls, goblins, giant spiders and a riddle contest in the dark, and discovers more courage than he knew he had.'),
  ('Matilda', 'Matilda Wormwood is a brilliant girl who reads every book in the library, but her parents think television is far more important. At school she meets the kind Miss Honey and the terrifying headmistress Miss Trunchbull. When Matilda discovers an extraordinary power, she decides it is time to stand up for herself and her teacher.'),
  ('I, Robot', 'A robopsychologist looks back on her career in a series of linked stories about the early days of intelligent robots. Each story turns on the Three Laws of Robotics and the surprising ways machines interpret them, from a robot that will not stop running in circles to one that believes it serves a higher master. A foundation of modern robot fiction.'),
  ('Pride and Prejudice', 'When the wealthy Mr Bingley and his proud friend Mr Darcy arrive in the neighbourhood, the five Bennet sisters'' prospects suddenly change. Quick-witted Elizabeth Bennet takes an instant dislike to Darcy, but first impressions prove misleading. Austen''s most beloved novel is a witty story of love, class and learning to judge fairly.'),
  ('How to Win Friends and Influence People', 'First published in 1936, Dale Carnegie''s guide offers simple principles for getting along with others: show genuine interest, remember names, listen well and avoid needless criticism. Illustrated with many stories, it remains a popular handbook for anyone who wants to communicate better at work and in daily life.'),
  ('Cosmos', 'Based on his landmark television series, Carl Sagan takes readers on a journey from the edge of the universe to the origins of life on Earth. He weaves together astronomy, history and the lives of great scientists to show how we came to understand our place among the stars. Wonder and clear explanation on every page.'),
  ('The Hound of the Baskervilles', 'Legend says a monstrous hound has haunted the Baskerville family for generations. When Sir Charles Baskerville is found dead on the moor with the prints of a gigantic dog nearby, Sherlock Holmes and Dr Watson are asked to protect his heir. A gripping mix of detection and gothic atmosphere, and Holmes''s most famous case.')
) as v(title, description)
where b.title = v.title
  and b.description not ilike 'overview%';

-- Product details for books whose edition data was entered by the team (04/11/2026).
update public.books set format = 'Paperback', language = 'English', publisher = 'HarperCollins Publishers',
  publication_date = '2002-03-05', isbn13 = '9780060935467', isbn10 = '0060935464',
  dimensions = '5.30 × 8.00 × 0.82 inches', shipping_weight_lbs = 0.55
where title = 'To Kill a Mockingbird' and isbn13 is null;
