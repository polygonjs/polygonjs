export declare class AttributeRequirementsController {
    private _attribute_names;
    constructor();
    reset(): void;
    assign_attributes_lines(): string;
    assign_arrays_lines(): string;
    attribute_presence_check_line(): string;
    add(attribute_name: string): void;
    static assign_attribute_line(attribute_name: string): string;
    static assign_item_size_line(attribute_name: string): string;
    static assign_array_line(attribute_name: string): string;
    static var_attribute(attribute_name: string): string;
    static var_attribute_size(attribute_name: string): string;
    static var_array(attribute_name: string): string;
    var_attribute_size(attribute_name: string): string;
    var_array(attribute_name: string): string;
}
