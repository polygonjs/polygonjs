import {ParamEvent} from './../poly/ParamEvent';
import {BaseParamType} from './_Base';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {DecomposedPath} from '../../core/DecomposedPath';
import {TypedStringParam} from './_BaseString';

export abstract class TypedPathParam<T extends ParamType.NODE_PATH | ParamType.PARAM_PATH> extends TypedStringParam<T> {
	public readonly decomposedPath = new DecomposedPath();

	override dispose(): void {
		this.scene().referencesController.resetReferenceFromParam(this);
		super.dispose();
	}

	abstract notifyPathRebuildRequired(node: BaseNodeType | BaseParamType): void;
	abstract notifyTargetParamOwnerParamsUpdated(node: BaseNodeType | BaseParamType): void;
	protected abstract _findTarget(): void;

	protected _handleReferences(node: BaseNodeType | BaseParamType | null, path: string) {
		this.scene().referencesController.setNamedNodesFromParam(this);
		if (node) {
			this.scene().referencesController.setReferenceFromParam(this, node);
		} else {
			this.scene().missingExpressionReferencesController.register(this, path);
		}
	}
	protected override async processComputation(): Promise<void> {
		if (this.expressionController?.active() && !this.expressionController.requires_entities()) {
			await super.processComputation();
		} else {
			this._findTarget();
		}
	}
	protected _setValuePathAndFindTarget(path: string) {
		this._value.setPath(path);
		this._findTarget();
		this.setDirty();
		this.emitController.emit(ParamEvent.VALUE_UPDATED);
	}
}
