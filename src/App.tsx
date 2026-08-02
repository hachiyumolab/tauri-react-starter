import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import "./App.css";
import { Home } from "./screens/Home";
import { Items } from "./screens/Items";
import { ComingSoon } from "./screens/ComingSoon";

// サイドバーのナビ項目（サンプル）。自分のアプリの画面に置き換えて使う。
type NavKey = "home" | "items" | "page-a" | "page-b" | "page-c";

const NAV: { key: NavKey; label: string; icon: ReactNode }[] = [
  {
    key: "home",
    label: "ホーム",
    icon: (
      <svg className="ic" viewBox="0 0 24 24">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    key: "items",
    label: "一覧",
    icon: (
      <svg className="ic" viewBox="0 0 24 24">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    key: "page-a",
    label: "ページA",
    icon: (
      <svg className="ic" viewBox="0 0 24 24">
        <path d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z" />
        <path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2" />
      </svg>
    ),
  },
  {
    key: "page-b",
    label: "ページB",
    icon: (
      <svg className="ic" viewBox="0 0 24 24">
        <path d="M4 20h16" />
        <path d="M7 20v-6M12 20V6M17 20v-9" />
      </svg>
    ),
  },
  {
    key: "page-c",
    label: "ページC",
    icon: (
      <svg className="ic" viewBox="0 0 24 24">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
];

const TITLES: Record<NavKey, string> = {
  home: "ホーム",
  items: "一覧",
  "page-a": "ページA",
  "page-b": "ページB",
  "page-c": "ページC",
};

function App() {
  const [collapsed, setCollapsed] = useState(false); // サイドバー：全開↔レール（その場で切替）
  const [active, setActive] = useState<NavKey>("home"); // 表示中の画面
  const [menuOpen, setMenuOpen] = useState(false); // アカウントメニュー
  const [drawerOpen, setDrawerOpen] = useState(false); // モバイルのドロワー開閉
  const [width, setWidth] = useState<number>(() => window.innerWidth); // ウィンドウ幅
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  // ウィンドウ幅を監視（レスポンシブ判定）
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 640;
  const isMedium = width >= 640 && width < 1024;
  const isWide = width >= 1024;

  // 段階が変わったら既定に戻す（広い=全開／中間=レール、オーバーレイは閉じる）
  useEffect(() => {
    setDrawerOpen(false);
    if (isWide) setCollapsed(false);
  }, [isMobile, isMedium, isWide]);

  const railVisual = (isWide && collapsed) || (isMedium && !drawerOpen); // アイコンレール表示か
  const overlayOpen = drawerOpen && (isMedium || isMobile); // 暗幕付きオーバーレイ表示中か
  const appClass = [
    "app",
    railVisual && "collapsed",
    isMedium && "medium",
    isMobile && "mobile",
    overlayOpen && "drawer-open",
  ]
    .filter(Boolean)
    .join(" ");

  // テーマをルート要素に反映（index.css の [data-theme] が効く）
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // アカウントメニュー：外側をクリックしたら閉じる
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".userbox")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  return (
    <div className={appClass}>
      {/* ===== サイドバー ===== */}
      <aside className="side">
        <div
          className="brand"
          onClick={() => {
            // レール時はブランドをクリックすると展開
            if (railVisual) {
              if (isMedium) setDrawerOpen(true);
              else setCollapsed(false);
            }
          }}
        >
          <span className="mark">
            {/* レールでホバーすると展開アイコンに変化 */}
            <span className="mark-hint" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 6l6 6-6 6M13 6l6 6-6 6" />
              </svg>
            </span>
          </span>
          <span className="wordmark">
            {/* TODO: 自分のアプリ名に変更（.g は色付けする部分） */}
            <span className="g">My</span>App
          </span>
          {!isMobile && (
            <button
              className="collapse"
              onClick={(e) => {
                e.stopPropagation();
                if (isMedium) setDrawerOpen((v) => !v);
                else setCollapsed((v) => !v);
              }}
              aria-label="サイドバーを開閉"
              title="サイドバーを開閉"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 6l-6 6 6 6" />
              </svg>
            </button>
          )}
        </div>

        <nav className="navscroll">
          {NAV.map((n) => (
            <div
              key={n.key}
              className={active === n.key ? "nav active" : "nav"}
              data-label={n.label}
              onClick={() => {
                setActive(n.key);
                setDrawerOpen(false);
              }}
            >
              {n.icon}
              <span className="lbl">{n.label}</span>
            </div>
          ))}
        </nav>

        <button className="cta">
          <svg className="ic" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="lbl">新規作成</span>
        </button>

        <div
          className={menuOpen ? "userbox open" : "userbox"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="avatar" />
          <div className="uinfo">
            <div className="nm">ユーザー名</div>
            <span className="chip">サンプル</span>
          </div>
          <svg className="uchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 15l6-6 6 6" />
          </svg>

          <div className="acct-menu" onClick={(e) => e.stopPropagation()}>
            <div className="am-head">
              <span className="avatar" />
              <div>
                <div className="nm">ユーザー名</div>
                <div className="am-sub">サンプルアカウント</div>
              </div>
            </div>
            <div className="am-div" />
            <button className="am-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              プロフィール
            </button>
            <button className="am-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
              </svg>
              設定
            </button>
            <div className="am-div" />
            <div className="am-item" style={{ color: "var(--text-faint)", cursor: "default" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
              バージョン v0.1.0
            </div>
          </div>
        </div>
      </aside>

      {/* ===== メイン ===== */}
      <div className="main">
        <div className="topbar">
          <button className="hamburger" onClick={() => setDrawerOpen((v) => !v)} aria-label="メニューを開く" title="メニュー">
            <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1>{TITLES[active]}</h1>
          <span className="grow" />
          <input className="search" placeholder="検索…" aria-label="検索" />
          <button
            className="tgl"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="ライト/ダークを切り替え"
            title="ライト/ダークを切り替え"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
              </svg>
            )}
          </button>
        </div>

        <div className="content">
          {active === "home" && <Home />}
          {active === "items" && <Items />}
          {active === "page-a" && <ComingSoon title="ページA" />}
          {active === "page-b" && <ComingSoon title="ページB" />}
          {active === "page-c" && <ComingSoon title="ページC" />}
        </div>
      </div>
      {overlayOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}
    </div>
  );
}

export default App;
