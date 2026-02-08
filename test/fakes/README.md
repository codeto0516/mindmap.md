# テスト用 Fakes

永続化をマークダウンファイルに一本化したため、リポジトリの Fake（`createFakeMapRepository` 等）は削除済み。

リポジトリ以外のテスト用ダブル（例: メール送信スタブ、外部 API のスタブ）はこの `test/fakes/` に置く。
