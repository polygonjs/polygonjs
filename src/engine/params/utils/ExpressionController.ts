import {BaseParamType} from '../_Base';
import {ExpressionManager} from '../../expressions/ExpressionManager';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreEntity} from '../../../core/geometry/Entity';
import {ParamType} from '../../poly/ParamType';
import {ParamValuesTypeMap} from '../types/ParamValuesTypeMap';
import {CoreObject} from '../../../core/geometry/Object';
import {MethodDependency} from '../../expressions/MethodDependency';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

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
	protected _method_dependencies_by_graph_node_id: Map<CoreGraphNodeId, MethodDependency> | undefined;
	// private _reset_bound = this.reset.bind(this);
	constructor(protected param: BaseParamType) {
		// this.param.dirtyController.addPostDirtyHook('expression_controller_reset', this._reset_bound);
	}
	// remove_dirty_hook() {
	// 	// this.param.dirtyController.removePostDirtyHook('expression_controller_reset');
	// }
	dispose() {
		this._resetMethodDependencies();
	}
	private _resetMethodDependencies() {
		this._method_dependencies_by_graph_node_id?.forEach((method_dependency) => {
			method_dependency.dispose();
		});
		this._method_dependencies_by_graph_node_id?.clear();
	}
	registerMethodDependency(method_dependency: MethodDependency) {
		this._method_dependencies_by_graph_node_id = this._method_dependencies_by_graph_node_id || new Map();
		this._method_dependencies_by_graph_node_id.set(method_dependency.graphNodeId(), method_dependency);
	}

	active() {
		return this._expression != null;
	}
	expression() {
		return this._expression;
	}
	is_errored() {
		if (this._manager) {
			return this._manager.is_errored();
		}
		return false;
	}
	error_message() {
		if (this._manager) {
			return this._manager.error_message();
		}
		return null;
	}
	requires_entities() {
		return this.param.options.isExpressionForEntities();
	}
	// private reset() {
	// 	this._manager?.clear_error();
	// }

	set_expression(expression: string | undefined, set_dirty: boolean = true) {
		this.param.scene().missingExpressionReferencesController.deregister_param(this.param);
		this.param.scene().expressionsController.deregister_param(this.param);

		if (this._expression != expression) {
			this._resetMethodDependencies();
			this._expression = expression;

			if (this._expression) {
				this._manager = this._manager || new ExpressionManager(this.param);
				this._manager.parseExpression(this._expression);
			} else {
				this._manager?.reset();
			}

			if (set_dirty) {
				this.param.setDirty();
			}
		}
	}

	update_from_method_dependency_name_change() {
		if (this._manager && this.active()) {
			this._manager.update_from_method_dependency_name_change();
		}
	}

	async compute_expression() {
		if (this._manager && this.active()) {
			const result = await this._manager.computeFunction();
			return result;
		}
	}
	async computeExpressionForEntities(entities: CoreEntity[], callback: EntityCallback<T>) {
		this.set_entities(entities, callback);
		await this.compute_expression();
		if (this._manager?.error_message()) {
			this.param.node.states.error.set(`expression evalution error: ${this._manager?.error_message()}`);
		}

		this.reset_entities();
	}
	computeExpressionForPoints(entities: CorePoint[], callback: PointEntityCallback<T>) {
		return this.computeExpressionForEntities(entities, callback as EntityCallback<T>);
	}
	computeExpressionForObjects(entities: CoreObject[], callback: ObjectEntityCallback<T>) {
		return this.computeExpressionForEntities(entities, callback as EntityCallback<T>);
	}
	entities() {
		return this._entities;
	}
	entity_callback() {
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
