import {BaseParamType, TypedParam} from './_Base';
import {BaseNodeType} from '../nodes/_Base';
import {ParamType} from '../poly/ParamType';
import {DecomposedPath} from '../../core/DecomposedPath';

export abstract class TypedPathParam<T extends ParamType> extends TypedParam<T> {
	public readonly decomposedPath = new DecomposedPath();

	override dispose(): void {
		this.scene().referencesController.resetReferenceFromParam(this);
		super.dispose();
	}

	abstract notifyPathRebuildRequired(node: BaseNodeType | BaseParamType): void;
	abstract notifyTargetParamOwnerParamsUpdated(node: BaseNodeType | BaseParamType): void;

	protected _handleReferences(node: BaseNodeType | BaseParamType | null, path: string) {
		this.scene().referencesController.setNamedNodesFromParam(this);
		if (node) {
			this.scene().referencesController.setReferenceFromParam(this, node);
		} else {
			this.scene().missingExpressionReferencesController.register(this, path);
		}
	}
}
