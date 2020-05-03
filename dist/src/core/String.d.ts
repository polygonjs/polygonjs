export declare class CoreString {
    static is_boolean(word: string): boolean;
    static to_boolean(word: string): boolean;
    static is_number(word: string): boolean;
    static tail_digits(word: string): number;
    static increment(word: string): string;
    static pluralize(word: string): string;
    static camel_case(word: string): string;
    static upper_first(word: string): string;
    static snake_case(word: string): string;
    static titleize(word: string): string;
    static type_to_class_name(word: string): string;
    static timestamp_to_seconds(word: string): number;
    static seconds_to_timestamp(seconds: number): string;
    static precision(val: number, decimals?: number): string;
    static ensure_float(num: number): string;
    static match_mask(word: string, rule: string): boolean;
    static matches_one_mask(word: string, masks: string[]): boolean;
    static attrib_names(word: string): string[];
    static to_id(val: string): number;
    static indices(indices_string: string): number[];
    static escape_line_breaks(word: string): string;
}
