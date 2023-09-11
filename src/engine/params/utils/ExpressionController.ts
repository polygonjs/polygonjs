import {CoreGroup} from './../../../core/geometry/Group';
import {BaseParamType} from '../_Base';
import {ExpressionManager} from '../../expressions/ExpressionManager';
import type {CorePoint} from '../../../core/geometry/entities/point/CorePoint';
import type {CoreVertex} from '../../../core/geometry/entities/vertex/CoreVertex';
import type {CorePrimitive} from '../../../core/geometry/entities/primitive/CorePrimitive';
import {CoreEntity} from '../../../core/geometry/CoreEntity';
import {ParamType} from '../../poly/ParamType';
import {ParamValuesTypeMap} from '../types/ParamValuesTypeMap';
import {BaseCoreObject} from '../../../core/geometry/entities/object/BaseCoreObject';
import {CoreObject} from '../../../core/geometry/modules/three/CoreObject';
import {MethodDependency} from '../../expressions/MethodDependency';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';

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
type CoreGroupEntityCallback<T extends ParamType> = (
	entity: CoreGroup,
	value: ParamValuesTypeMap[T] | any /*TODO: typescript: any is used here mostly to compile*/
) => void;

export class ExpressionController<T extends ParamType> {
	protected _expression: string | undefined;
	protected _entities: CoreEntity[] | undefined;
	protected _entityCallback: EntityCallback<T> | undefined;
	protected _manager: ExpressionManager | undefined;
	protected _methodDependenciesByGraphNodeId: Map<CoreGraphNodeId, MethodDependency> | undefined;
	// private _reset_bound = this.reset.bind(this);
	constructor(protected param: BaseParamType) {
		// this.param.dirtyController.addPostDirtyHook('expression_controller_reset', this._reset_bound);
	}
	// remove_dirty_hook() {
	// 	// this.param.dirtyController.removePostDirtyHook('expression_controller_reset');
	// }
	dispose() {
		this.param.scene().expressionsController.deregisterParam(this.param);
		this._resetMethodDependencies();
	}
	private _resetMethodDependencies() {
		this._methodDependenciesByGraphNodeId?.forEach((methodDependency) => {
			methodDependency.dispose();
		});
		this._methodDependenciesByGraphNodeId?.clear();
	}
	registerMethodDependency(methodDependency: MethodDependency) {
		this._methodDependenciesByGraphNodeId = this._methodDependenciesByGraphNodeId || new Map();
		this._methodDependenciesByGraphNodeId.set(methodDependency.graphNodeId(), methodDependency);
	}

	active() {
		return this._expression != null;
	}
	expression() {
		return this._expression;
	}
	isErrored() {
		if (this._manager) {
			return this._manager.isErrored();
		}
		return false;
	}
	errorMessage() {
		if (this._manager) {
			return this._manager.errorMessage();
		}
		return null;
	}
	entitiesDependent(): boolean {
		const managerEntitiesDependent: boolean = this._manager?.generatedFunctionEntitiesDependent() || false;
		return this.param.options.isExpressionForEntities() && managerEntitiesDependent;
	}
	// private reset() {
	// 	this._manager?.clear_error();
	// }

	setExpression(expression: string | undefined, set_dirty: boolean = true) {
		this.param.scene().missingExpressionReferencesController.deregisterParam(this.param);
		this.param.scene().expressionsController.deregisterParam(this.param);

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

	updateFromMethodDependencyNameChange() {
		if (this._manager && this.active()) {
			this._manager.updateFromMethodDependencyNameChange();
		}
	}

	computeExpression() {
		if (this._manager && this.active()) {
			return this._manager.computeFunction();
		}
	}
	async computeExpressionForEntities(entities: CoreEntity[], callback: EntityCallback<T>) {
		this._setEntities(entities, callback);
		await this.computeExpression();
		const errorMessage = this._manager?.errorMessage();
		if (errorMessage) {
			this.param.node.states.error.set(`expression evaluation error: ${errorMessage}`);
		}

		this._resetEntities();
	}
	computeExpressionForPoints(entities: CorePoint[], callback: PointEntityCallback<T>) {
		return this.computeExpressionForEntities(entities, callback as EntityCallback<T>);
	}
	computeExpressionForVertices(entities: CoreVertex<CoreObjectType>[], callback: PointEntityCallback<T>) {
		return this.computeExpressionForEntities(entities, callback as EntityCallback<T>);
	}
	computeExpressionForPrimitives(entities: CorePrimitive<CoreObjectType>[], callback: PointEntityCallback<T>) {
		return this.computeExpressionForEntities(entities, callback as EntityCallback<T>);
	}
	computeExpressionForObjects<OT extends CoreObjectType>(
		entities: BaseCoreObject<OT>[],
		callback: ObjectEntityCallback<T>
	) {
		return this.computeExpressionForEntities(entities, callback as EntityCallback<T>);
	}
	computeExpressionForCoreGroup(entity: CoreGroup, callback: CoreGroupEntityCallback<T>) {
		return this.computeExpressionForEntities([entity], callback as EntityCallback<T>);
	}
	entities() {
		return this._entities;
	}
	entityCallback() {
		return this._entityCallback;
	}
	private _setEntities(entities: CoreEntity[], callback: EntityCallback<T>) {
		this._entities = entities;
		this._entityCallback = callback;
	}
	private _resetEntities() {
		this._entities = undefined;
		this._entityCallback = undefined;
	}
}
