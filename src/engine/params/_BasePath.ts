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
		if (path == '') {
			// no need to handle references if param value is empty
			// as no node could match this path
			return;
		}

		this.scene().referencesController.setNamedNodesFromParam(this);
		if (node) {
			this.scene().referencesController.setReferenceFromParam(this, node);
			this.scene().missingExpressionReferencesController.deregisterParam(this);
		} else {
			this.scene().missingExpressionReferencesController.register(this, path);
		}
	}
	protected override async processComputation(): Promise<void> {
		if (this.expressionController?.active() && !this.expressionController.entitiesDependent()) {
			await super.processComputation();
		} else {
			this._findTarget();
		}
	}
	protected override processRawInputWithoutExpression() {
		const wasErrored = this.states.error.active();
		if (this._value.path() != this._raw_input || this._expression_controller || wasErrored) {
			this._setValuePathAndFindTarget(this._raw_input, true);
			this.states.error.clear();
			this.emitController.emit(ParamEvent.VALUE_UPDATED);
			this.options.executeCallback();
			if (this._expression_controller) {
				this._expression_controller.setExpression(undefined, false);
				this._expression_controller = undefined;
				this.emitController.emit(ParamEvent.EXPRESSION_UPDATED); // ensure expression is considered removed
			}
		}
	}
	protected _setValuePathAndFindTarget(path: string, setDirty: boolean) {
		this._value.setPath(path);
		this._findTarget();
		if (setDirty) {
			this.setDirty(); // setDirty here creates an infinite loop when using with a copy sop
		}
		this.emitController.emit(ParamEvent.VALUE_UPDATED);
	}
}
