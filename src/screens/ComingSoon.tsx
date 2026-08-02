// 未実装の画面用のプレースホルダ
export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="screen">
      <div className="card">
        <div className="empty">
          <div className="empty-badge">🚧</div>
          <h2>{title}は準備中です</h2>
          <p>この画面はこれから実装します。デザインシステムに沿って作っていきます。</p>
        </div>
      </div>
    </section>
  );
}
