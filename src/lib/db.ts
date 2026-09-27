import postgres from "postgres";

declare global {
  var __sql: postgres.Sql | undefined;
  var __schemaReady: Promise<void> | undefined;
}

function connectionString() {
  const url =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres database (e.g. Neon from the Vercel Marketplace).",
    );
  }
  return url;
}

export function sql() {
  if (!globalThis.__sql) {
    const url = connectionString();
    const isLocal = /localhost|127\.0\.0\.1/.test(url);
    globalThis.__sql = postgres(url, {
      ssl: isLocal ? false : "require",
      max: 5,
      idle_timeout: 20,
      // Neon's pooler (PgBouncer) does not support prepared statements.
      prepare: false,
      onnotice: () => {},
    });
  }
  return globalThis.__sql;
}

/** Creates tables on first use (idempotent) and seeds a starter menu if empty. */
export function ensureSchema() {
  if (!globalThis.__schemaReady) {
    globalThis.__schemaReady = migrate().catch((err) => {
      globalThis.__schemaReady = undefined;
      throw err;
    });
  }
  return globalThis.__schemaReady;
}

async function migrate() {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '☕',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await db`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      options JSONB NOT NULL DEFAULT '[]'::jsonb,
      image_url TEXT,
      is_available BOOLEAN NOT NULL DEFAULT true,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await db`
    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      old_price NUMERIC(12,2),
      image_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await db`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )`;

  const [{ count }] = await db`SELECT count(*)::int AS count FROM categories`;
  if (count === 0) await seed(db);
}

async function seed(db: postgres.Sql) {
  const starter: { name: string; icon: string; items: [string, string, number][] }[] = [
    {
      name: "قهوة ساخنة",
      icon: "☕",
      items: [
        ["إسبريسو", "شوت قهوة مركّز بنكهة غنية", 2],
        ["كابتشينو", "إسبريسو مع حليب مبخّر ورغوة كثيفة", 3],
        ["لاتيه", "إسبريسو ناعم مع حليب مبخّر", 3.5],
        ["قهوة عربية", "قهوة لبنانية أصيلة بالهال", 1.5],
      ],
    },
    {
      name: "مشروبات باردة",
      icon: "🧋",
      items: [
        ["آيس لاتيه", "إسبريسو مع حليب بارد وثلج", 3.5],
        ["فرابيه كراميل", "قهوة مثلّجة مع كراميل وكريمة", 4.5],
        ["عصير ليموناضة بالنعناع", "منعش ومحضّر طازج", 3],
      ],
    },
    {
      name: "كريب حلو",
      icon: "🥞",
      items: [
        ["كريب نوتيلا", "كريب طازج محشو نوتيلا", 4],
        ["كريب نوتيلا وموز", "نوتيلا مع شرائح الموز", 4.5],
        ["كريب لوتس", "كريمة لوتس مع بسكويت مطحون", 5],
      ],
    },
    {
      name: "كريب مالح",
      icon: "🧀",
      items: [
        ["كريب جبنة", "مزيج أجبان ذائبة", 4],
        ["كريب دجاج", "دجاج متبّل مع جبنة وخضار", 5.5],
      ],
    },
  ];

  await db.begin(async (tx) => {
    for (const [ci, cat] of starter.entries()) {
      const [row] = await tx`
        INSERT INTO categories (name, icon, sort_order)
        VALUES (${cat.name}, ${cat.icon}, ${ci}) RETURNING id`;
      for (const [ii, [name, description, price]] of cat.items.entries()) {
        await tx`
          INSERT INTO menu_items (category_id, name, description, price, sort_order, is_featured)
          VALUES (${row.id}, ${name}, ${description}, ${price}, ${ii}, ${ii === 0})`;
      }
    }
    await tx`
      INSERT INTO offers (title, description, price, old_price)
      VALUES ('عرض الصباح', 'كابتشينو + كريب نوتيلا', 6, 7)`;
  });
}
