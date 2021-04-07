import {DeleteSopNode} from '../../Delete';
import {CoreEntity} from '../../../../../core/geometry/Entity';
import {isBooleanTrue} from '../../../../../core/BooleanValue';

export class ByExpressionHelper {
	constructor(private node: DeleteSopNode) {}
	async evalForEntities(entities: CoreEntity[]) {
		const param = this.node.p.expression;
		if (this.node.p.expression.hasExpression() && param.expressionController) {
			await this.eval_expressions_for_points_with_expression(entities);
		} else {
			this.eval_expressions_without_expression(entities);
		}
	}

	private async eval_expressions_for_points_with_expression(entities: CoreEntity[]) {
		const param = this.node.p.expression;
		if (param.expressionController) {
			await param.expressionController.compute_expression_for_entities(entities, (entity, value) => {
				if (value) {
					this.node.entitySelectionHelper.select(entity);
				}
			});
		}
	}
	private eval_expressions_without_expression(entities: CoreEntity[]) {
		const value = isBooleanTrue(this.node.pv.expression);
		if (value) {
			for (let entity of entities) {
				this.node.entitySelectionHelper.select(entity);
			}
		}
	}
}
