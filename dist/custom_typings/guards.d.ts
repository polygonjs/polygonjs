interface typeMap {
    string: string;
    number: number;
    boolean: boolean;
}
declare type PrimitiveOrConstructor = {
    new (...args: any[]): any;
} | keyof typeMap;
declare type GuardedType<T extends PrimitiveOrConstructor> = T extends {
    new (...args: any[]): infer U;
} ? U : T extends keyof typeMap ? typeMap[T] : never;
