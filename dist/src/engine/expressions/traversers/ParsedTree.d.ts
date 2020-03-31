import jsep from 'jsep';
export declare class ParsedTree {
    node: jsep.Expression | undefined;
    error_message: string | undefined;
    constructor();
    parse_expression(string: string): void;
    parse_expression_for_string_param(string: string): void;
    static string_value_elements(v: string): string[];
    private reset;
}
