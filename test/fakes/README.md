# テスト用 Fakes

## Application 単体テストでリポジトリのダブルを使う場合

**Application の単体テスト**でリポジトリのダブルが必要なときは、この **`test/fakes/`** の `Fake*`（`createFakeMapRepository` など）を使う。Infrastructure の `Mock*` に依存しないことで、クリーンアーキテクチャの「テストが Infrastructure に依存しない」を満たす。

- **ポート（インターフェース）**: `src/domain/model/*/*-repository.ts`
- **実装**: `test/fakes/fake-*-repository.ts` は Domain のみ import し、`setInitialData()` / `clear()` でテストデータをセットできる（拡張機能化に伴い Folder 等は削除済み）。

## E2E・開発・Infrastructure テストでリポジトリのダブルを使う場合

**E2E・開発（`USE_MOCK_REPOSITORIES=true`）・Infrastructure 自身のテスト**では、**`src/infrastructure/repositories/mock`** の `Mock*`（`createMockUserRepository()` など）を使う。

- テストでリポジトリが必要なときは `createMockUserRepository()` 等を呼び出し、必要なら返り値の `setInitialData()` / `clear()` でデータをセットする。

## その他のテスト用ダブル

リポジトリ以外のテスト用ダブル（例: メール送信スタブ、外部 API のスタブ）もこの `test/fakes/` に置く。
