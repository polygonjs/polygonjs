import {DeleteSopNode} from '../../Delete';
import {CoreEntity} from '../../../../../core/geometry/CoreEntity';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {ExpressionController} from '../../../../params/utils/ExpressionController';
import {ParamType} from '../../../../poly/ParamType';

export class ByExpressionHelper {
	constructor(private node: DeleteSopNode) {}
	async evalForEntities(entities: CoreEntity[]) {
		const param = this.node.p.expression;
		if (
			this.node.p.expression.hasExpression() &&
			param.expressionController &&
			param.expressionController.entitiesDependent()
		) {
			await this._evalEntityDependentExpression(entities, param.expressionController);
		} else {
			this._evalExpressionsWithoutEntityDependentExpression(entities);
		}
	}

	private async _evalEntityDependentExpression(
		entities: CoreEntity[],
		expressionController: ExpressionController<ParamType.BOOLEAN>
	) {
		await expressionController.computeExpressionForEntities(entities, (entity, value: boolean) => {
			if (value) {
				this.node.entitySelectionHelper.select(entity);
			}
		});
	}
	private _evalExpressionsWithoutEntityDependentExpression(entities: CoreEntity[]) {
		const value = isBooleanTrue(this.node.pv.expression);
		if (value) {
			for (let entity of entities) {
				this.node.entitySelectionHelper.select(entity);
			}
		}
	}
}
