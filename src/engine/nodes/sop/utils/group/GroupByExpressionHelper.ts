import {CoreEntity} from '../../../../../core/geometry/Entity';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {ExpressionController} from '../../../../params/utils/ExpressionController';
import {ParamType} from '../../../../poly/ParamType';
import {CADGroupSopNode} from '../../CADGroup';

export class GroupByExpressionHelper {
	constructor(private node: CADGroupSopNode) {}
	async evalForEntities(allEntities: CoreEntity[], selectedIndices: Set<number>) {
		const param = this.node.p.expression;
		if (
			this.node.p.expression.hasExpression() &&
			param.expressionController &&
			param.expressionController.entitiesDependent()
		) {
			await this._evalEntityDependentExpression(allEntities, selectedIndices, param.expressionController);
		} else {
			this._evalExpressionsWithoutEntityDependentExpression(allEntities, selectedIndices);
		}
	}

	private async _evalEntityDependentExpression(
		allEntities: CoreEntity[],
		selectedIndices: Set<number>,
		expressionController: ExpressionController<ParamType.BOOLEAN>
	) {
		await expressionController.computeExpressionForEntities(allEntities, (entity, value: boolean) => {
			if (value) {
				selectedIndices.add(entity.index());
			}
		});
	}
	private _evalExpressionsWithoutEntityDependentExpression(allEntities: CoreEntity[], selectedIndices: Set<number>) {
		const value = isBooleanTrue(this.node.pv.expression);
		if (value) {
			for (let entity of allEntities) {
				selectedIndices.add(entity.index());
			}
		}
	}
}
