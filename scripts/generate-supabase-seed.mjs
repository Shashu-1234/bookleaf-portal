import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Usage: node scripts/generate-supabase-seed.mjs <bookleaf_sample_data.json>");
}

const outputPath = resolve("supabase/seed.sql");
const source = JSON.parse(await readFile(resolve(sourcePath), "utf8"));

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  return value === null || value === undefined ? "null" : String(value);
}

function sqlTextArray(values) {
  if (!values?.length) return "'{}'::text[]";
  return `array[${values.map(sqlString).join(", ")}]::text[]`;
}

const authors = source.authors.map(
  (author) =>
    `  (${[
      sqlString(author.author_id),
      sqlString(author.name),
      sqlString(author.email.toLowerCase()),
      sqlString(author.phone),
      sqlString(author.city),
      sqlString(author.joined_date),
    ].join(", ")})`,
);

const books = source.authors.flatMap((author) =>
  author.books.map(
    (book) =>
      `  (${[
        sqlString(book.book_id),
        sqlString(author.author_id),
        sqlString(book.title),
        sqlString(book.isbn),
        sqlString(book.genre),
        sqlString(book.publication_date),
        sqlString(book.status),
        sqlNumber(book.mrp),
        sqlNumber(book.author_royalty_per_copy),
        sqlNumber(book.total_copies_sold),
        sqlNumber(book.total_royalty_earned),
        sqlNumber(book.royalty_paid),
        sqlNumber(book.royalty_pending),
        sqlString(book.last_royalty_payout_date),
        sqlString(book.print_partner),
        sqlTextArray(book.available_on),
      ].join(", ")})`,
  ),
);

const sql = `-- Generated from the assignment-provided bookleaf_sample_data.json.
-- Re-run: node scripts/generate-supabase-seed.mjs D:\\bookleaf_sample_data.json
begin;

insert into public.authors (id, name, email, phone, city, joined_date)
values
${authors.join(",\n")}
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
${books.join(",\n")}
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
`;

await writeFile(outputPath, sql, "utf8");
console.log(`Wrote ${source.authors.length} authors and ${books.length} books to ${outputPath}`);
