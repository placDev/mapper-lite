export class Cloner {
  private static cache = new WeakMap();
  static deep<T>(value: T) {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (this.cache.has(value)) {
      return this.cache.get(value);
    }

    if (value instanceof Date) {
      const result = new Date(value.getTime());
      this.cache.set(value, result);
      return result as any;
    }

    if (value instanceof RegExp) {
      const result = new RegExp(value.source, value.flags);
      this.cache.set(value, result);
      return result as any;
    }

    if (Array.isArray(value)) {
      const arr = new Array(value.length);
      this.cache.set(value, arr);
      for (let i = 0; i < value.length; ++i) {
        arr[i] = this.deep(value[i]);
      }
      return arr as any;
    }

    if (value instanceof Map) {
      const clonedMap = new Map();
      this.cache.set(value, clonedMap);
      value.forEach((v, k) => {
        clonedMap.set(this.deep(k), this.deep(v));
      });
      return clonedMap as any;
    }

    if (value instanceof Set) {
      const clonedSet = new Set();
      this.cache.set(value, clonedSet);
      value.forEach((v) => {
        clonedSet.add(this.deep(v));
      });
      return clonedSet as any;
    }

    const prototype = Object.getPrototypeOf(value);
    const clonedObj = Object.create(prototype);
    this.cache.set(value, clonedObj);

    for (const key of Object.getOwnPropertyNames(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor) {
        if ("value" in descriptor) {
          descriptor.value = this.deep((value as any)[key]);
        }
        Object.defineProperty(clonedObj, key, descriptor);
      }
    }

    for (const symbol of Object.getOwnPropertySymbols(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, symbol);
      if (descriptor) {
        if ("value" in descriptor) {
          descriptor.value = this.deep((value as any)[symbol]);
        }
        Object.defineProperty(clonedObj, symbol, descriptor);
      }
    }

    return clonedObj;
  }
}
