import { InputsController } from './InputsController';
import { OutputsController } from './OutputsController';
import { ConnectionsController } from './ConnectionsController';
import { SavedConnectionPointsDataController } from './SavedConnectionPointsDataController';
import { NodeContext } from '../../../poly/NodeContext';
import { TypedNode } from '../../_Base';
import { ConnectionPointsController } from './ConnectionPointsController';
import { ParamType } from '../../../poly/ParamType';
import { ParamInitValueSerializedTypeMap } from '../../../params/types/ParamInitValueSerializedTypeMap';
import { ParamOptions } from '../../../params/utils/OptionsController';
export declare type OverridenOptions = Dictionary<string | number>;
export declare type SimpleParamJsonExporterData<T extends ParamType> = ParamInitValueSerializedTypeMap[T];
export interface ComplexParamJsonExporterData<T extends ParamType> {
    type?: T;
    default_value?: ParamInitValueSerializedTypeMap[T];
    raw_input?: ParamInitValueSerializedTypeMap[T];
    options?: ParamOptions;
    overriden_options?: OverridenOptions;
}
export declare type ParamJsonExporterData<T extends ParamType> = SimpleParamJsonExporterData<T> | ComplexParamJsonExporterData<T>;
export declare type ParamJsonExporterDataByName = Dictionary<ParamJsonExporterData<ParamType>>;
export declare type ParamsJsonExporterData = Dictionary<ParamJsonExporterData<ParamType>>;
export interface ParamInitData<T extends ParamType> {
    raw_input?: ParamInitValueSerializedTypeMap[T];
    simple_data?: SimpleParamJsonExporterData<T>;
    complex_data?: ComplexParamJsonExporterData<T>;
}
export declare type ParamsInitData = Dictionary<ParamInitData<ParamType>>;
export declare class IOController<NC extends NodeContext> {
    protected node: TypedNode<NC, any>;
    protected _inputs: InputsController<NC> | undefined;
    protected _outputs: OutputsController<NC> | undefined;
    protected _connections: ConnectionsController<NC>;
    protected _saved_connection_points_data: SavedConnectionPointsDataController<NC> | undefined;
    protected _connection_points: ConnectionPointsController<NC> | undefined;
    constructor(node: TypedNode<NC, any>);
    get connections(): ConnectionsController<NC>;
    get inputs(): InputsController<NC>;
    has_inputs(): boolean;
    get outputs(): OutputsController<NC>;
    has_outputs(): boolean;
    get connection_points(): ConnectionPointsController<NC>;
    get has_connection_points_controller(): boolean;
    get saved_connection_points_data(): SavedConnectionPointsDataController<NC>;
    clear_saved_connection_points_data(): void;
}
