import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// Rust の db::Item に対応する型
type Item = {
  id: number;
  title: string;
  note: string | null;
  category: string;
  created_at: string;
};

// アイテム一覧画面（サンプル：DB → Rust → 画面 の動作確認）
export function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Rust の list_items コマンドを呼んでサンプルデータを取得
    invoke<Item[]>("list_items")
      .then(setItems)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <section className="screen">
      {error && <p className="error">読み込みエラー: {error}</p>}

      <div className="card">
        <table className="data">
          <thead>
            <tr>
              <th>タイトル</th>
              <th>カテゴリ</th>
              <th>メモ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.title}</td>
                <td>
                  <span className="pill">{it.category}</span>
                </td>
                <td className="muted">{it.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
