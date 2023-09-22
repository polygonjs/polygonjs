import {CoreEntity} from '../../../../../core/geometry/CoreEntity';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {ExpressionController} from '../../../../params/utils/ExpressionController';
import {ParamType} from '../../../../poly/ParamType';
import {CADGroupSopNode} from '../../CADGroup';
import {CoreEntitySelectionState, updateSelectionState} from './GroupCommon';

export class GroupByExpressionHelper {
	constructor(private node: CADGroupSopNode) {}
	async evalForEntities(allEntities: CoreEntity[], selectionStates: CoreEntitySelectionState) {
		const param = this.node.p.expression;
		if (param.hasExpression() && param.expressionController && param.expressionController.entitiesDependent()) {
			await this._evalEntityDependentExpression(allEntities, selectionStates, param.expressionController);
		} else {
			this._evalExpressionsWithoutEntityDependentExpression(allEntities, selectionStates);
		}
	}

	private async _evalEntityDependentExpression(
		allEntities: CoreEntity[],
		selectionStates: CoreEntitySelectionState,
		expressionController: ExpressionController<ParamType.BOOLEAN>
	) {
		await expressionController.computeExpressionForEntities(allEntities, (entity, value: boolean) => {
			updateSelectionState(selectionStates, entity, value);
		});
	}
	private _evalExpressionsWithoutEntityDependentExpression(
		allEntities: CoreEntity[],
		selectionStates: CoreEntitySelectionState
	) {
		const value = isBooleanTrue(this.node.pv.expression);
		for (const entity of allEntities) {
			updateSelectionState(selectionStates, entity, value);
		}
	}
}
