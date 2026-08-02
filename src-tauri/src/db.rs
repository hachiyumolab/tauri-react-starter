// DB層：SQLite接続・テーブル作成（マイグレーション）・初期データ投入・読み取り。
// 画面には直接SQLを出さず、この層を通してデータを扱う。
//
// ── このファイルはテンプレートのサンプルです ──
// 汎用の items テーブルを1つだけ用意しています。実際のアプリを作るときは、
// この items を自分のドメインのテーブル（例：tasks / notes / customers …）に
// 置き換えていってください。「マイグレーション → 初期データ → 一覧取得」という
// 流れはそのまま真似できます。

use rusqlite::{params, Connection};
use std::path::Path;

// 画面へ返すデータの形。serde::Serialize でJSONに変換されて React に渡る。
#[derive(serde::Serialize)]
pub struct Item {
    pub id: i64,
    pub title: String,
    pub note: Option<String>,
    pub category: String,
    pub created_at: String,
}

// DBを開いて、必要な初期化（テーブル作成・初期データ）まで済ませて返す。
pub fn open_and_init(db_path: &Path) -> rusqlite::Result<Connection> {
    let conn = Connection::open(db_path)?;
    // 参照整合性（外部キー制約）を有効化する
    conn.pragma_update(None, "foreign_keys", "ON")?;
    run_migrations(&conn)?;
    seed_items_if_empty(&conn)?;
    Ok(conn)
}

// 簡易マイグレーション：SQLiteの user_version を見て、未適用の差分だけ実行する。
// 将来テーブルを足すときは SCHEMA_V2 を書いて version < 2 の分岐を追加していく。
fn run_migrations(conn: &Connection) -> rusqlite::Result<()> {
    let version: i64 = conn.pragma_query_value(None, "user_version", |row| row.get(0))?;
    if version < 1 {
        conn.execute_batch(SCHEMA_V1)?;
        conn.pragma_update(None, "user_version", 1)?;
    }
    Ok(())
}

// アイテムがまだ1件も無ければ、動作確認用のサンプルデータを投入する。
fn seed_items_if_empty(conn: &Connection) -> rusqlite::Result<()> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0))?;
    if count > 0 {
        return Ok(());
    }

    // (タイトル, メモ, カテゴリ, 表示順)
    let seeds: &[(&str, &str, &str, i64)] = &[
        ("サンプル項目 A", "これはテンプレートの動作確認用データです。", "サンプル", 1),
        ("サンプル項目 B", "DB → Rust → 画面 の流れが動いていれば表示されます。", "サンプル", 2),
        ("サンプル項目 C", "不要になったら seed_items_if_empty を書き換えてください。", "サンプル", 3),
    ];

    let mut stmt = conn.prepare(
        "INSERT INTO items (title, note, category, sort_order)
         VALUES (?1, ?2, ?3, ?4)",
    )?;
    for (title, note, category, sort_order) in seeds {
        stmt.execute(params![title, note, category, sort_order])?;
    }
    Ok(())
}

// 有効なアイテムを一覧で返す（表示順→作成日時順）。
pub fn list_items(conn: &Connection) -> rusqlite::Result<Vec<Item>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, note, category, created_at
         FROM items
         WHERE is_active = 1
         ORDER BY sort_order, created_at",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Item {
            id: row.get(0)?,
            title: row.get(1)?,
            note: row.get(2)?,
            category: row.get(3)?,
            created_at: row.get(4)?,
        })
    })?;
    rows.collect()
}

// スキーマ v1。まずは汎用の items テーブルを1つだけ用意する。
// 自分のアプリでは、ここを必要なテーブル定義に置き換えていく。
const SCHEMA_V1: &str = r#"
-- 汎用アイテム（サンプル）
CREATE TABLE IF NOT EXISTS items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    note       TEXT,
    category   TEXT NOT NULL DEFAULT '未分類',
    is_active  INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"#;
