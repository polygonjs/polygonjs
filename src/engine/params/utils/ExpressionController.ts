import {BaseParamType} from '../_Base';
import {ExpressionManager} from '../../expressions/ExpressionManager';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreEntity} from '../../../core/geometry/Entity';
import {ParamType} from '../../poly/ParamType';
import {ParamValuesTypeMap} from '../types/ParamValuesTypeMap';
import {CoreObject} from '../../../core/geometry/Object';

// type ParamTypeElem = ParamType;
type EntityCallback<T extends ParamType> = (
	entity: CoreEntity,
	value: ParamValuesTypeMap[T] | any /*TODO: typescript: any is used here mostly to compile*/
) => void;
type PointEntityCallback<T extends ParamType> = (
	entity: CorePoint,
	value: ParamValuesTypeMap[T] | any /*TODO: typescript: any is used here mostly to compile*/
) => void;
type ObjectEntityCallback<T extends ParamType> = (
	entity: CoreObject,
	value: ParamValuesTypeMap[T] | any /*TODO: typescript: any is used here mostly to compile*/
) => void;

export class ExpressionController<T extends ParamType> {
	protected _expression: string | undefined;
	protected _entities: CoreEntity[] | undefined;
	protected _entity_callback: EntityCallback<T> | undefined;
	protected _manager: ExpressionManager | undefined;
	constructor(protected param: BaseParamType) {}

	get active() {
		return this._expression != null;
	}
	get expression() {
		return this._expression;
	}
	get is_errored() {
		if (this._manager) {
			return this._manager.is_errored;
		}
		return false;
	}
	get error_message() {
		if (this._manager) {
			return this._manager.error_message;
		}
		return null;
	}
	get requires_entities() {
		return this.param.options.is_expression_for_entities;
	}
	set_expression(expression: string | undefined, set_dirty: boolean = true) {
		if (this._expression != expression) {
			this._expression = expression;

			if (this._expression) {
				this._manager = this._manager || new ExpressionManager(this.param);
				this._manager.parse_expression(this._expression);
			} else {
				if (this._manager) {
					this._manager.reset();
				}
			}

			if (set_dirty) {
				this.param.set_dirty();
			}
		}
	}

	update_from_method_dependency_name_change() {}

	async compute_expression() {
		if (this._manager && this.active) {
			const result = await this._manager.compute_function();
			return result;
		}
	}
	private async compute_expression_for_entities(entities: CoreEntity[], callback: EntityCallback<T>) {
		this.set_entities(entities, callback);
		console.log('compute_expression_for_entities');
		await this.compute_expression();
		console.log('this._manager?.error_message', this._manager?.error_message);
		if (this._manager?.error_message) {
			console.warn('expression evalution error');
			this.param.node.states.error.set(`expression evalution error: ${this._manager?.error_message}`);
		}

		this.reset_entities();
	}
	compute_expression_for_points(entities: CorePoint[], callback: PointEntityCallback<T>) {
		return this.compute_expression_for_entities(entities, callback as EntityCallback<T>);
	}
	compute_expression_for_objects(entities: CoreObject[], callback: ObjectEntityCallback<T>) {
		return this.compute_expression_for_entities(entities, callback as EntityCallback<T>);
	}
	get entities() {
		return this._entities;
	}
	get entity_callback() {
		return this._entity_callback;
	}
	set_entities(entities: CoreEntity[], callback: EntityCallback<T>) {
		this._entities = entities;
		this._entity_callback = callback;
	}
	reset_entities() {
		this._entities = undefined;
		this._entity_callback = undefined;
	}
}
