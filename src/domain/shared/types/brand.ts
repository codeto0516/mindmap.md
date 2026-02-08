/**
 * プリミティブに型安全な識別子を付与するためのブランド型
 * 例: Brand<string, "UserId"> で string と UserId の混同を防ぐ
 */
export type Brand<T, B extends string> = T & {
  readonly __brand: B;
};
