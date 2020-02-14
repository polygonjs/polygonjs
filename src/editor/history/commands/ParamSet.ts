import {BaseCommand} from './_Base';
// import {BaseNode} from 'src/Engine/Node/_Base'
// import {BaseParamType} from 'src/engine/params/_Base';
import {ParamType} from 'src/engine/poly/ParamType';
import {ParamConstructorMap} from 'src/engine/params/types/ParamConstructorMap';
// import {ParamValuesTypeMap} from 'src/engine/params/types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from 'src/engine/params/types/ParamInitValuesTypeMap';

export class ParamSetCommand<T extends ParamType> extends BaseCommand {
	constructor(
		private _param: ParamConstructorMap[T],
		private _new_raw_input: ParamInitValuesTypeMap[T],
		private _old_raw_input?: ParamInitValuesTypeMap[T]
	) {
		super();

		if (this._old_raw_input === undefined) {
			this._old_raw_input = this._param.raw_input as never;
		}
	}

	do() {
		this._param.set(this._new_raw_input as never);
	}

	undo() {
		this._param.set(this._old_raw_input as never);
	}
}
