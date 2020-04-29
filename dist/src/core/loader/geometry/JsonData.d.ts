import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { CoreAttributeData } from '../../geometry/AttributeData';
export interface JsonDataLoaderOptions {
    data_keys_prefix?: string;
    skip_entries?: string;
    do_convert?: boolean;
    convert_to_numeric?: string;
}
export declare class JsonDataLoader {
    _json: any[] | undefined;
    _attribute_datas_by_name: Dictionary<CoreAttributeData>;
    private _options;
    constructor(options?: JsonDataLoaderOptions);
    load(url: string, success_callback: (geometry: BufferGeometry) => void, progress_callback: (() => void) | undefined, error_callback: (error: ErrorEvent) => void | undefined): void;
    get_prefixed_json(json: any, prefixes: string[]): any[];
    set_json(json: any): any;
    create_object(): BufferGeometry;
    private _find_attributes;
    private _attribute_values_for_name;
    _value_has_subentries(value: any): boolean;
}
