declare type IterateeMethod = (element: any, index?: number) => void;
declare type IterateeMethodCount = (index: number) => void;
interface CoreIteratorOptions {
    max_time_per_chunk?: number;
    check_every_interations?: number;
}
export declare class CoreIterator {
    private _array;
    private _iteratee_method_array;
    private _bound_next_with_array;
    private _current_array_element;
    private _array_index;
    private _count;
    private _iteratee_method_count;
    private _bound_next_with_count;
    private _current_count_index;
    private _max_time_per_chunk;
    private _check_every_interations;
    private _resolve;
    constructor(options?: CoreIteratorOptions);
    start_with_count(count: number, iteratee_method: IterateeMethodCount): Promise<unknown>;
    next_with_count(): void;
    start_with_array(array: any[], iteratee_method: IterateeMethod): Promise<unknown>;
    next_with_array(): void;
}
export {};
