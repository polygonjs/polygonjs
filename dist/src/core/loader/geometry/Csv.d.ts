import { BufferGeometry } from 'three/src/core/BufferGeometry';
export declare class CsvLoader {
    private attribute_names?;
    static SEPARATOR: string;
    static VECTOR_SEPARATOR: string;
    private attribute_names_from_first_line;
    private lines;
    private points_count;
    private attribute_values_by_name;
    private attribute_data_by_name;
    private _loading;
    constructor(attribute_names?: string[] | undefined);
    load(url: string): Promise<BufferGeometry | undefined>;
    private load_data;
    private infer_types;
    private _value_from_line_element;
    read_values(): void;
    create_points(): BufferGeometry | undefined;
}
