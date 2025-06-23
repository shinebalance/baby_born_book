# 命名書生成アプリ

赤ちゃんの命名書を簡単に作成・共有できるWebアプリケーションです。

![命名書生成アプリ](https://via.placeholder.com/800x400/FFE4E6/333333?text=命名書生成アプリ)

## 🎯 概要

このアプリケーションでは、赤ちゃんの基本情報を入力するだけで、美しい命名書を作成できます。作成した命名書はPDFとしてダウンロードしたり、URLで家族や友人と共有することができます。

### ✨ 主な機能

- **📝 簡単入力フォーム**: 名前、ふりがな、生年月日、身長・体重などを入力
- **📷 写真アップロード**: 背景画像やお子様の写真を追加可能
- **👆 ドラッグ&ドロップ**: プレビュー画面で各要素の位置を自由に調整
- **📄 PDF生成**: A4サイズの高品質PDFとしてダウンロード
- **🔗 共有URL**: 設定内容をURLで簡単共有
- **✅ バリデーション**: 入力内容の自動チェック
- **💾 一時保存**: ローカルストレージを使った自動保存
- **📱 レスポンシブ**: スマートフォンからPCまで対応

### 🎨 特徴

- **和暦対応**: 令和・平成の年号表記に対応
- **美しいデザイン**: 優しいグラデーションと日本語フォント
- **直感的操作**: ドラッグで簡単に要素配置を調整
- **完全ブラウザ完結**: サーバー不要でプライバシー保護

## 🚀 開始方法

### 前提条件

- Node.js (v18以上推奨)
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/shinebalance/baby_born_book.git

# プロジェクトディレクトリに移動
cd baby_born_book

# 依存関係をインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてアプリを開始してください。

### ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` フォルダに生成されます。

## 📖 使用方法

### 1. 基本情報の入力
- **名前**: お子様の名前（漢字）を入力
- **ふりがな**: 名前のふりがなを入力
- **生年月日**: カレンダーから選択
- **誕生時刻**: 時刻を選択（オプション）
- **身長・体重**: 数値を入力（オプション）

### 2. 写真のアップロード（オプション）
- **背景画像**: 命名書の背景に使用する画像
- **お子様の写真**: 円形で表示される写真

### 3. 名前の由来（オプション）
- 名前に込めた思いや由来を200文字以内で記入

### 4. プレビューで調整
- プレビュー画面で各セクションの位置をドラッグして調整
- リアルタイムで変更が反映されます

### 5. 出力・共有
- **PDF生成**: ダウンロードボタンでPDF形式で保存
- **共有URL**: URLボタンで設定を共有可能なリンクを生成

## 🌐 GitHub Pagesでのホスティング

### 1. GitHub Actionsの設定

`.github/workflows/deploy.yml` ファイルを作成：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 2. Vite設定の調整

`vite.config.js` にベースパスを追加：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/baby_born_book/', // リポジトリ名に合わせて変更
  server: {
    port: 3000,
    open: true
  }
})
```

### 3. デプロイ手順

1. **リポジトリをGitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **GitHub Pagesを有効化**
   - GitHubリポジトリページの「Settings」タブ
   - 左メニューの「Pages」をクリック
   - Source を「GitHub Actions」に設定

3. **自動デプロイの確認**
   - コードをプッシュすると自動的にビルド・デプロイが実行
   - `https://shinebalance.github.io/baby_born_book/` でアクセス可能

### 4. カスタムドメインの設定（オプション）

独自ドメインを使用する場合：
1. `public/CNAME` ファイルを作成してドメイン名を記述
2. DNSレコードでCNAMEを設定
3. GitHub Pages設定でカスタムドメインを指定

## 🛠️ 技術スタック

- **フレームワーク**: Vue.js 3 (Composition API)
- **ビルドツール**: Vite
- **CSS**: Tailwind CSS v4
- **PDF生成**: pdf-lib
- **フォント**: Noto Sans JP, Inter
- **ホスティング**: GitHub Pages (推奨)

## 📁 プロジェクト構造

```
baby_born_book/
├── src/
│   ├── components/
│   │   ├── atoms/          # 基本的なUI部品
│   │   ├── molecules/      # 複合的なUI部品
│   │   └── organisms/      # 複雑なUI部品
│   ├── utils/             # ユーティリティ関数
│   ├── App.vue           # メインアプリケーション
│   ├── main.js           # エントリーポイント
│   └── style.css         # グローバルスタイル
├── public/               # 静的ファイル
├── dist/                # ビルド出力 (生成される)
└── 機能要求.md           # 機能仕様書
```

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビュート

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

問題や提案がございましたら、[Issues](https://github.com/shinebalance/baby_born_book/issues)でお知らせください。

---

❤️ 大切な家族の記念に、素敵な命名書をお作りください。