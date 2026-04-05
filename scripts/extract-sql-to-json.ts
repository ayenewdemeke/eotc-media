/**
 * Extracts specified tables from a MySQL SQL dump and writes them as JSON files.
 * Usage: npx ts-node scripts/extract-sql-to-json.ts
 */
import * as fs from "fs";
import * as path from "path";

const SQL_FILE = path.join(__dirname, "../../eotcmeng_db.sql");
const HIGHLIGHTS_SQL_FILE = path.join(__dirname, "../../bl_highlights.sql");
const OUT_DIR = path.join(__dirname, "../prisma/data");

const TABLES_TO_EXTRACT = [
  "users",
  "roles",
  "role_user",
  "contact_us",
  // Hymns
  "hm_approval_statuses",
  "hm_languages",
  "hm_categories",
  "hm_sub_categories",
  "hm_singers",
  "hm_channels",
  "hm_hymns",
  "hm_category_hymn",
  "hm_hymn_language",
  "hm_hymn_singer",
  "hm_hymn_sub_category",
  "hm_favorites",
  "hm_comments",
  // Sermons
  "sm_approval_statuses",
  "sm_languages",
  "sm_categories",
  "sm_sub_categories",
  "sm_preachers",
  "sm_channels",
  "sm_sermons",
  "sm_category_sermon",
  "sm_language_sermon",
  "sm_sermon_sub_category",
  "sm_preacher_sermon",
  "sm_favorites",
  // Books
  "cb_approval_statuses",
  "cb_languages",
  "cb_categories",
  "cb_sub_categories",
  "cb_authors",
  "cb_books",
  "cb_book_language",
  "cb_book_category",
  "cb_book_sub_category",
  "cb_author_book",
  "cb_likes",
  "cb_book_comments",
  "cb_copyright_reports",
  // Quiz
  "qz_approval_statuses",
  "qz_languages",
  "qz_categories",
  "qz_sub_categories",
  "qz_question_types",
  "qz_difficulties",
  "qz_questions",
  "qz_choices",
  "qz_language_question",
  "qz_category_question",
  "qz_question_sub_category",
  "qz_rooms",
  "qz_room_members",
  "qz_room_member_round",
  "qz_rounds",
  "qz_round_questions",
  "qz_round_answers",
  "qz_round_results",
];

// Parse the column list from an INSERT header like:
// INSERT INTO `table` (`col1`, `col2`, ...) VALUES
function parseColumns(header: string): string[] {
  const match = header.match(/\(([^)]+)\)\s+VALUES/);
  if (!match) return [];
  return match[1].split(",").map((c) => c.trim().replace(/`/g, ""));
}

// Tokenize one VALUES row: (val1, val2, ...) [, or ;]
function parseRow(line: string, columns: string[]): Record<string, unknown> {
  // Strip trailing , or ; then outer parentheses
  let s = line.trimEnd();
  if (s.endsWith(";") || s.endsWith(",")) s = s.slice(0, -1);
  s = s.trim();
  // Remove outer parens
  if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1);

  const values: unknown[] = [];
  let i = 0;

  while (i <= s.length) {
    // Skip leading whitespace
    while (i < s.length && s[i] === " ") i++;
    if (i >= s.length) break;

    if (s[i] === "'") {
      // Quoted string — walk until unescaped closing quote
      i++;
      let str = "";
      while (i < s.length) {
        if (s[i] === "\\") {
          i++;
          switch (s[i]) {
            case "n":  str += "\n"; break;
            case "r":  str += "\r"; break;
            case "t":  str += "\t"; break;
            case "'":  str += "'";  break;
            case "\\":  str += "\\"; break;
            case "0":  str += "\0"; break;
            default:   str += "\\" + s[i];
          }
          i++;
        } else if (s[i] === "'") {
          i++; // skip closing quote
          break;
        } else {
          str += s[i++];
        }
      }
      values.push(str);
    } else if (s.slice(i, i + 4) === "NULL") {
      values.push(null);
      i += 4;
    } else {
      // Number or bare token
      let token = "";
      while (i < s.length && s[i] !== ",") {
        token += s[i++];
      }
      token = token.trim();
      const num = Number(token);
      values.push(isNaN(num) ? token : num);
    }

    // Skip comma separator
    while (i < s.length && (s[i] === " " || s[i] === ",")) {
      if (s[i] === ",") { i++; break; }
      i++;
    }
  }

  const obj: Record<string, unknown> = {};
  columns.forEach((col, idx) => {
    obj[col] = values[idx] !== undefined ? values[idx] : null;
  });
  return obj;
}

function extractTable(
  lines: string[],
  tableName: string
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const insertPrefix = `INSERT INTO \`${tableName}\``;

  let columns: string[] = [];
  let inInsert = false;

  for (const line of lines) {
    if (line.startsWith(insertPrefix)) {
      columns = parseColumns(line);
      inInsert = true;
      continue;
    }

    if (inInsert) {
      const trimmed = line.trim();
      if (trimmed.startsWith("(")) {
        rows.push(parseRow(trimmed, columns));
        if (trimmed.endsWith(";")) inInsert = false;
      } else {
        inInsert = false;
      }
    }
  }

  return rows;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Main SQL dump
  console.log(`Reading ${path.basename(SQL_FILE)}...`);
  const mainLines = fs.readFileSync(SQL_FILE, "utf-8").split("\n");
  console.log(`  ${mainLines.length.toLocaleString()} lines\n`);

  for (const tableName of TABLES_TO_EXTRACT) {
    process.stdout.write(`Extracting ${tableName}...`);
    const rows = extractTable(mainLines, tableName);
    const outFile = path.join(OUT_DIR, `${tableName}.json`);
    fs.writeFileSync(outFile, JSON.stringify(rows, null, 2), "utf-8");
    console.log(` ${rows.length} rows → ${path.basename(outFile)}`);
  }

  // Secondary: bl_highlights.sql
  console.log(`\nReading ${path.basename(HIGHLIGHTS_SQL_FILE)}...`);
  const hlLines = fs.readFileSync(HIGHLIGHTS_SQL_FILE, "utf-8").split("\n");
  console.log(`  ${hlLines.length.toLocaleString()} lines\n`);

  process.stdout.write(`Extracting bl_highlights...`);
  const hlRows = extractTable(hlLines, "bl_highlights");
  const hlOut = path.join(OUT_DIR, "bl_highlights.json");
  fs.writeFileSync(hlOut, JSON.stringify(hlRows, null, 2), "utf-8");
  console.log(` ${hlRows.length} rows → bl_highlights.json`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
