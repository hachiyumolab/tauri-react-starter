// アプリの中核（Rust）エントリポイント。
// 起動時にDBを初期化し、画面(React)から呼ばれるコマンドを定義する。

mod db; // DB層（接続・テーブル作成・初期データ・読み取り）

use std::sync::Mutex;
use tauri::{Manager, State};

// アプリ全体で共有する状態。DB接続を1つだけ持ち、Mutexで排他制御する。
struct AppState {
    db: Mutex<rusqlite::Connection>,
}

// アイテムの一覧を返すコマンド。画面から invoke("list_items") で呼ぶ。
// 自分のアプリでは、これを真似してコマンドを増やしていく。
#[tauri::command]
fn list_items(state: State<AppState>) -> Result<Vec<db::Item>, String> {
    // ロックを取得（複数処理が同時にDBを触らないため）
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::list_items(&conn).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // OSごとに適切な「アプリ専用データフォルダ」を取得
            let dir = app
                .path()
                .app_data_dir()
                .expect("アプリデータフォルダの取得に失敗しました");
            std::fs::create_dir_all(&dir).expect("データフォルダの作成に失敗しました");
            let db_path = dir.join("app.db");

            // DBを開き、テーブル作成＋サンプルデータの投入まで済ませる
            let conn = db::open_and_init(&db_path).expect("DBの初期化に失敗しました");

            // 以降どのコマンドからも使えるよう、状態として登録
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![list_items])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
