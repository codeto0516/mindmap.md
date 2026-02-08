# モックリポジトリ

このディレクトリには、メモリ内でデータを保持するモックリポジトリの実装が含まれています。
テストや開発時に Prisma（DB）を使わずに動作確認する際に使用できます。

## 利用可能なモックリポジトリ

- `createMockAccountRepository()` - アカウントリポジトリのモック実装を返す
- `createMockAccountMembershipRepository()` - アカウントメンバーシップリポジトリのモック実装を返す
- `createMockUserRepository()` - ユーザーリポジトリのモック実装を返す
- `createMockWorkspaceRepository()` - ワークスペースリポジトリのモック実装を返す
- `createMockWorkspaceMembershipRepository()` - ワークスペースメンバーシップリポジトリのモック実装を返す

## 使用方法

### 1. モックリポジトリの作成

```typescript
import {
  createMockAccountRepository,
  createMockUserRepository,
  createMockWorkspaceRepository,
  createMockAccountMembershipRepository,
  createMockWorkspaceMembershipRepository,
} from "@/infrastructure/repositories/mock";

const accountRepository = createMockAccountRepository();
const userRepository = createMockUserRepository();
const workspaceRepository = createMockWorkspaceRepository();
const accountMembershipRepository = createMockAccountMembershipRepository();
const workspaceMembershipRepository = createMockWorkspaceMembershipRepository();
```

### 2. 初期データを設定

各モックリポジトリには `setInitialData()` メソッドがあり、初期データを設定できます。
`setInitialData` をサポートするリポジトリで使用できます。

```typescript
import { createMockUserRepository } from "@/infrastructure/repositories/mock";
import { User } from "@/domain/model/user/user";

const userRepository = createMockUserRepository();
const initialUsers: User[] = [
  {
    id: "user-1",
    name: "テストユーザー",
    email: "test@example.com",
    avatarUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
userRepository.setInitialData(initialUsers);
```

### 3. データのクリア

テストの前後でデータをクリアしたい場合は `clear()` メソッドを使用します。
（`clear()` をサポートするリポジトリ: すべてのモックリポジトリ）

```typescript
userRepository.clear();
```

### 4. テスト・開発時の切り替え

`factory.ts` の `createUserRepository()` 等は、環境変数 `USE_MOCK_REPOSITORIES` が `"true"` または `"1"` のとき Mock 実装を返し、それ以外のとき Prisma 実装を返します。

アプリ全体でモックに切り替える場合は、`.env.local` に以下を設定してください。

```bash
USE_MOCK_REPOSITORIES=true
```

単体テストでモックだけを使う場合は、create 関数を呼び出して利用します。

```typescript
// テスト例: モックを直接使う
import { createMockUserRepository } from "@/infrastructure/repositories/mock";

const userRepository = createMockUserRepository();
// setInitialData でデータをセットしたあと、テスト対象に渡す
```

## 各モックの共通メソッド

- **setInitialData(data)** - 初期データをセット（既存データはクリアされる）
- **clear()** - 保持しているデータをすべてクリア

上記に加え、各モックは対応するドメインのリポジトリインターフェース（`AccountRepository` など）のメソッド（`findById`, `findAll`, `save`, `delete` など）を実装しています。
