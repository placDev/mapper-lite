export type ConstructorType<T = any> = new (...arg: any[]) => T;

export type IsMethod<T> = T extends (...args: any[]) => any ? true : false;
export type ClassFields<T> = Pick<
    T,
    {
        [K in keyof T]: IsMethod<T[K]> extends true ? never : K;
    }[keyof T]
>;

export type NonPrimitiveKeys<T> = {
    [K in keyof T]: T[K] extends object ? K : never
}[keyof T];
export type NonPrimitive<T> = Pick<T, NonPrimitiveKeys<T>>;