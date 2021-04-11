import {InputsController} from './InputsController';
import {OutputsController} from './OutputsController';
import {ConnectionsController} from './ConnectionsController';
import {SavedConnectionPointsDataController} from './SavedConnectionPointsDataController';
import {NodeContext} from '../../../poly/NodeContext';
import {TypedNode} from '../../_Base';
import {ConnectionPointsController} from './ConnectionPointsController';
import {ParamType} from '../../../poly/ParamType';
import {ParamInitValueSerializedTypeMap} from '../../../params/types/ParamInitValueSerializedTypeMap';
import {ParamOptions} from '../../../params/utils/OptionsController';
import {PolyDictionary} from '../../../../types/GlobalTypes';

export type OverridenOptions = PolyDictionary<string | number>;

export type SimpleParamJsonExporterData<T extends ParamType> = ParamInitValueSerializedTypeMap[T];

export interface ComplexParamJsonExporterData<T extends ParamType> {
	type?: T;
	default_value?: ParamInitValueSerializedTypeMap[T];
	raw_input?: ParamInitValueSerializedTypeMap[T];
	options?: ParamOptions;
	overriden_options?: OverridenOptions;
	// components?: ParamJsonExporterDataByName;
	// expression?: string;
}
export type ParamJsonExporterData<T extends ParamType> =
	| SimpleParamJsonExporterData<T>
	| ComplexParamJsonExporterData<T>;
export type ParamJsonExporterDataByName = PolyDictionary<ParamJsonExporterData<ParamType>>;

export type ParamsJsonExporterData = PolyDictionary<ParamJsonExporterData<ParamType>>;

export interface ParamInitData<T extends ParamType> {
	raw_input?: ParamInitValueSerializedTypeMap[T];
	simple_data?: SimpleParamJsonExporterData<T>;
	complex_data?: ComplexParamJsonExporterData<T>;
}
export type ParamsInitData = PolyDictionary<ParamInitData<ParamType>>;

export class IOController<NC extends NodeContext> {
	protected _inputs: InputsController<NC> | undefined;
	protected _outputs: OutputsController<NC> | undefined;
	protected _connections: ConnectionsController<NC> = new ConnectionsController(this.node);
	protected _saved_connection_points_data: SavedConnectionPointsDataController<NC> | undefined;
	protected _connection_points: ConnectionPointsController<NC> | undefined;

	constructor(protected node: TypedNode<NC, any>) {}

	get connections() {
		return this._connections;
	}

	//
	//
	// inputs
	//
	//
	get inputs(): InputsController<NC> {
		return (this._inputs = this._inputs || new InputsController(this.node));
	}
	has_inputs() {
		return this._inputs != null;
	}

	//
	//
	// outputs
	//
	//
	get outputs(): OutputsController<NC> {
		return (this._outputs = this._outputs || new OutputsController(this.node));
	}
	has_outputs() {
		return this._outputs != null;
	}

	//
	//
	// connection_points
	//
	//
	get connection_points(): ConnectionPointsController<NC> {
		return (this._connection_points =
			this._connection_points || new ConnectionPointsController(this.node, this.node.context() as NC));
	}
	get has_connection_points_controller(): boolean {
		return this._connection_points != null;
	}

	//
	//
	// saved connection points data
	//
	//
	get saved_connection_points_data() {
		return (this._saved_connection_points_data =
			this._saved_connection_points_data || new SavedConnectionPointsDataController(this.node));
	}
	clear_saved_connection_points_data() {
		if (this._saved_connection_points_data) {
			this._saved_connection_points_data.clear();
			this._saved_connection_points_data = undefined;
		}
	}
}
