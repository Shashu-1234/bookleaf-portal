-- Generated from the assignment-provided bookleaf_sample_data.json.
-- Re-run: node scripts/generate-supabase-seed.mjs D:\bookleaf_sample_data.json
begin;

insert into public.authors (id, name, email, phone, city, joined_date)
values
  ('AUTH001', 'Priya Sharma', 'priya.sharma@email.com', '+91-98765-43210', 'Mumbai', '2023-03-15'),
  ('AUTH002', 'Rohit Kapoor', 'rohit.kapoor@email.com', '+91-87654-32109', 'Delhi', '2022-11-08'),
  ('AUTH003', 'Ananya Reddy', 'ananya.reddy@email.com', '+91-76543-21098', 'Hyderabad', '2024-02-20'),
  ('AUTH004', 'Vikram Joshi', 'vikram.joshi@email.com', '+91-65432-10987', 'Pune', '2023-07-12'),
  ('AUTH005', 'Meera Nair', 'meera.nair@email.com', '+91-54321-09876', 'Kochi', '2023-01-05'),
  ('AUTH006', 'Arjun Malhotra', 'arjun.malhotra@email.com', '+91-43210-98765', 'Chandigarh', '2024-06-01'),
  ('AUTH007', 'Sneha Kulkarni', 'sneha.kulkarni@email.com', '+91-32109-87654', 'Bangalore', '2022-09-18'),
  ('AUTH008', 'Farhan Sheikh', 'farhan.sheikh@email.com', '+91-21098-76543', 'Lucknow', '2023-10-01'),
  ('AUTH009', 'Kavita Deshmukh', 'kavita.deshmukh@email.com', '+91-10987-65432', 'Nagpur', '2024-04-10'),
  ('AUTH010', 'Diya Chatterjee', 'diya.chatterjee@email.com', '+91-09876-54321', 'Kolkata', '2023-05-22')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  city = excluded.city,
  joined_date = excluded.joined_date;

insert into public.books (
  id, author_id, title, isbn, genre, publication_date, status, mrp,
  author_royalty_per_copy, total_copies_sold, total_royalty_earned,
  royalty_paid, royalty_pending, last_royalty_payout_date, print_partner,
  available_on
)
values
  ('BK001', 'AUTH001', 'Whispers of the Ganges', '978-93-5XXXX-01-1', 'Literary Fiction', '2023-06-20', 'Published & Live', 399, 35, 342, 11970, 8400, 3570, '2025-10-15', 'In-House', array['Amazon India', 'Flipkart', 'BookLeaf Store']::text[]),
  ('BK002', 'AUTH001', 'The Saffron Diaries', '978-93-5XXXX-02-8', 'Non-Fiction / Memoir', '2024-01-10', 'Published & Live', 450, 42, 189, 7938, 7938, 0, '2025-12-01', 'In-House', array['Amazon India', 'BookLeaf Store']::text[]),
  ('BK003', 'AUTH002', 'Code & Karma', '978-93-5XXXX-03-5', 'Self-Help / Technology', '2023-02-14', 'Published & Live', 350, 30, 876, 26280, 21000, 5280, '2025-09-01', 'Repro India', array['Amazon India', 'Flipkart', 'Amazon US', 'BookLeaf Store']::text[]),
  ('BK004', 'AUTH002', 'Startup Sutra', '978-93-5XXXX-04-2', 'Business / Entrepreneurship', '2024-05-22', 'Published & Live', 499, 48, 1203, 57744, 50000, 7744, '2025-11-15', 'In-House', array['Amazon India', 'Flipkart', 'Amazon US', 'Amazon UK', 'BookLeaf Store']::text[]),
  ('BK005', 'AUTH003', 'Between Two Temples', '978-93-5XXXX-05-9', 'Historical Fiction', '2024-07-05', 'Published & Live', 425, 38, 67, 2546, 0, 2546, null, 'Epitome Books', array['Amazon India', 'BookLeaf Store']::text[]),
  ('BK006', 'AUTH004', 'Debugging Life', '978-93-5XXXX-06-6', 'Self-Help', '2023-11-30', 'Published & Live', 299, 25, 534, 13350, 10000, 3350, '2025-08-20', 'In-House', array['Amazon India', 'Flipkart', 'BookLeaf Store']::text[]),
  ('BK007', 'AUTH004', 'The Last Monsoon', '978-93-5XXXX-07-3', 'Poetry', '2024-08-15', 'Published & Live', 199, 15, 123, 1845, 1845, 0, '2025-12-01', 'In-House', array['Amazon India', 'BookLeaf Store']::text[]),
  ('BK008', 'AUTH005', 'Cardamom & Chaos', '978-93-5XXXX-08-0', 'Contemporary Fiction', '2023-04-18', 'Published & Live', 375, 32, 445, 14240, 14240, 0, '2025-12-01', 'Repro India', array['Amazon India', 'Flipkart', 'BookLeaf Store']::text[]),
  ('BK009', 'AUTH005', 'Letters from Lakshadweep', '978-93-5XXXX-09-7', 'Travel / Non-Fiction', '2024-03-01', 'Published & Live', 550, 55, 201, 11055, 8000, 3055, '2025-10-15', 'In-House', array['Amazon India', 'Amazon US', 'BookLeaf Store']::text[]),
  ('BK010', 'AUTH006', 'Turban Tales', '978-93-5XXXX-10-3', 'Humor / Essays', '2024-09-10', 'Published & Live', 325, 28, 88, 2464, 0, 2464, null, 'In-House', array['Amazon India', 'BookLeaf Store']::text[]),
  ('BK011', 'AUTH007', 'The Algorithm of Love', '978-93-5XXXX-11-0', 'Romance', '2022-12-25', 'Published & Live', 299, 25, 1567, 39175, 35000, 4175, '2025-11-15', 'Repro India', array['Amazon India', 'Flipkart', 'Amazon US', 'BookLeaf Store']::text[]),
  ('BK012', 'AUTH007', 'Ctrl+Alt+Delete My Ex', '978-93-5XXXX-12-7', 'Romance / Humor', '2024-02-14', 'Published & Live', 350, 30, 723, 21690, 18000, 3690, '2025-10-15', 'In-House', array['Amazon India', 'Flipkart', 'BookLeaf Store']::text[]),
  ('BK013', 'AUTH007', 'Midnight in Mysore', '978-93-5XXXX-13-4', 'Thriller', null, 'In Production - Cover Design', null, null, 0, 0, 0, 0, null, null, '{}'::text[]),
  ('BK014', 'AUTH008', 'Ghazal of the Forgotten', '978-93-5XXXX-14-1', 'Poetry / Urdu Literature', '2024-01-26', 'Published & Live', 250, 20, 156, 3120, 3120, 0, '2025-12-01', 'Epitome Books', array['Amazon India', 'BookLeaf Store']::text[]),
  ('BK015', 'AUTH009', 'Raising Roots', '978-93-5XXXX-15-8', 'Parenting / Non-Fiction', null, 'In Production - Typesetting', null, null, 0, 0, 0, 0, null, null, '{}'::text[]),
  ('BK016', 'AUTH009', 'The Nagpur Notebooks', '978-93-5XXXX-16-5', 'Essays / Memoir', '2024-11-05', 'Published & Live', 299, 25, 34, 850, 0, 850, null, 'In-House', array['Amazon India', 'BookLeaf Store']::text[]),
  ('BK017', 'AUTH010', 'Durga’s Daughters', '978-93-5XXXX-17-2', 'Literary Fiction', '2023-10-15', 'Published & Live', 475, 45, 612, 27540, 25000, 2540, '2025-11-15', 'Repro India', array['Amazon India', 'Flipkart', 'Amazon US', 'BookLeaf Store']::text[]),
  ('BK018', 'AUTH010', 'Howrah Nights', '978-93-5XXXX-18-9', 'Crime / Thriller', '2025-01-20', 'Published & Live', 399, 35, 45, 1575, 0, 1575, null, 'In-House', array['Amazon India', 'BookLeaf Store']::text[])
on conflict (id) do update set
  author_id = excluded.author_id,
  title = excluded.title,
  isbn = excluded.isbn,
  genre = excluded.genre,
  publication_date = excluded.publication_date,
  status = excluded.status,
  mrp = excluded.mrp,
  author_royalty_per_copy = excluded.author_royalty_per_copy,
  total_copies_sold = excluded.total_copies_sold,
  total_royalty_earned = excluded.total_royalty_earned,
  royalty_paid = excluded.royalty_paid,
  royalty_pending = excluded.royalty_pending,
  last_royalty_payout_date = excluded.last_royalty_payout_date,
  print_partner = excluded.print_partner,
  available_on = excluded.available_on;

commit;
