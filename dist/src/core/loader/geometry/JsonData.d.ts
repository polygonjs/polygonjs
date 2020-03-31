import { Points } from 'three/src/objects/Points';
import { CoreAttributeData } from '../../geometry/AttributeData';
import { Object3D } from 'three/src/core/Object3D';
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
    load(url: string, success_callback: (object: Object3D) => void, progress_callback: (() => void) | undefined, error_callback: (error: ErrorEvent) => void | undefined): void;
    get_prefixed_json(json: any, prefixes: string[]): any[];
    set_json(json: any): any;
    create_object(): Points;
    private _find_attributes;
    private _attribute_values_for_name;
    _value_has_subentries(value: any): boolean;
}
