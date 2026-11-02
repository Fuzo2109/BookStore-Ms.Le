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
