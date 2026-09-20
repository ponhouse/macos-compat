# macOS 27互換性情報

macOS 27のアプリ対応状況を公開するためのリポジトリです。データの正本はGit管理し、更新履歴はコミット履歴で確認できます。

## 公開ページ

GitHub Pagesを有効にすると、次のURLで公開されます。

- https://ponhouse.github.io/macos-compat/
- JSON: https://ponhouse.github.io/macos-compat/apps.json
- 確認元: https://ponhouse.github.io/macos-compat/research_sources.json

既存サイトからは、次のようにJSONを参照できます。

```js
const response = await fetch("https://ponhouse.github.io/macos-compat/apps.json");
const data = await response.json();
```

## ファイル構成

- `apps.json`: アプリごとの互換性情報
- `research_sources.json`: 確認元URLと確認日
- `index.html`: JSONを読み込んで表示する公開ページ
- `script.js`: 表示・検索ロジック
- `style.css`: ページのスタイル

## 更新方法

1. `apps.json` に確認済みの情報を追加・更新する
2. 必要に応じて `research_sources.json` に確認元を追加する
3. 変更内容が分かるコミットメッセージで保存する

互換性情報は、確認できた内容と確認日を添えて更新してください。未確認の項目は `unknown` のままにし、推測で `compatible` や `incompatible` に変更しない方針です。
