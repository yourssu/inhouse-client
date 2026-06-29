export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Mutable<T> =
  T extends ReadonlyArray<infer U>
    ? Array<Mutable<U>>
    : T extends Record<number | string | symbol, unknown>
      ? { -readonly [K in keyof T]: Mutable<T[K]> }
      : T;

export type Merge<T, U> = Prettify<Omit<T, keyof U> & U>;

export type Diff<T, U> = Prettify<Omit<T, keyof U>>;

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

const emptyObjectSymbol: unique symbol = Symbol('emptyObjectSymbol');

export type EmptyObjectType = { [emptyObjectSymbol]?: never };

/**
 * union 타입에서 빈 객체를 제외시켜요.
 * @example
 * type Test = { a: 1 } | {} | { b: 2 };
 * type Result = ExcludeEmptyObject<Test>; // { a: 1 } | { b: 2 }
 */
export type ExcludeEmptyObject<T> = T extends AtLeastOne<T> ? T : never;

export type ValueOf<T> = T[keyof T];

export type GetIndexedField<T, K> = K extends keyof T
  ? T[K]
  : K extends `${number}`
    ? 'length' extends keyof T
      ? number extends T['length']
        ? number extends keyof T
          ? T[number]
          : undefined
        : undefined
      : undefined
    : undefined;

export type FieldWithPossiblyUndefined<T, Key> =
  | Extract<T, undefined>
  | GetFieldType<Exclude<T, undefined>, Key>;

export type IndexedFieldWithPossiblyUndefined<T, Key> =
  | Extract<T, undefined>
  | GetIndexedField<Exclude<T, undefined>, Key>;

export type GetFieldType<T, P> = P extends `${infer Left}.${infer Right}`
  ? Left extends keyof Exclude<T, undefined>
    ? Extract<T, undefined> | FieldWithPossiblyUndefined<Exclude<T, undefined>[Left], Right>
    : Left extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? FieldWithPossiblyUndefined<
            IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>,
            Right
          >
        : undefined
      : undefined
  : P extends keyof T
    ? T[P]
    : P extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>
        : undefined
      : IndexedFieldWithPossiblyUndefined<T, P>;

export type GetFieldTypeStrictly<T, P> =
  GetFieldType<T, P> extends undefined ? never : Prettify<GetFieldType<T, P>>;

export type MapNullable<T> = Prettify<{
  [K in keyof T]: T[K] extends Record<string, any>
    ? T[K] extends Array<any>
      ? null | T[K]
      : T[K] extends (...args: any[]) => any
        ? null | T[K]
        : T[K] extends null | undefined
          ? T[K]
          : MapNullable<T[K]>
    : null | T[K];
}>;

export type MapNonNullable<T> = Prettify<{
  [K in keyof T]: T[K] extends Record<string, any>
    ? T[K] extends Array<any>
      ? NonNullable<T[K]>
      : T[K] extends (...args: any[]) => any
        ? NonNullable<T[K]>
        : T[K] extends null | undefined
          ? never
          : MapNonNullable<T[K]>
    : NonNullable<T[K]>;
}>;
