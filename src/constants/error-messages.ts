import type { ReservedKeys } from "../types/base.js";

export class ReservedKeysError extends Error {
    constructor(
        key: ReservedKeys,
    ){
        super(`Error: "${key}" is a reserved key and cannot be used`);

        this.name = 'ReservedKeysError';
    }
}