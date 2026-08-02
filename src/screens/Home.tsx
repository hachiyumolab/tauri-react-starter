import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// ホーム画面（ようこそ＋簡単なサマリ）
export function Home() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Rust の list_items を呼んで、登録済みのアイテム数を表示
    invoke<unknown[]>("list_items")
      .then((rows) => setCount(rows.length))
      .catch(() => {});
  }, []);

  return (
    <section className="screen">
      <div className="card welcome">
        <h2>ようこそ 👋</h2>
        <p>
          Tauri + React + TypeScript のスターターテンプレートです。
          左のメニューはサンプル。ここから自分のアプリを作り始めましょう。
        </p>
        <div className="stat">
          <span className="stat-num tabular">{count ?? "—"}</span>
          <span className="stat-lbl">サンプルDBの登録件数</span>
        </div>
      </div>
    </section>
  );
}
