/**
 * Recursively converts BigInt fields in an object to strings
 * to prevent JSON serialization errors.
 */
export const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const serializedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serializedObj[key] = serializeBigInt(obj[key]);
      }
    }
    return serializedObj;
  }
  return obj;
};

/**
 * Recursively removes undefined fields from an object
 * to satisfy strict exactOptionalPropertyTypes compilation settings.
 */
export const removeUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (typeof obj === "bigint") return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefined);
  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          newObj[key] = removeUndefined(obj[key]);
        }
      }
    }
    return newObj;
  }
  return obj;
};
