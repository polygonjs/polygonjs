import {DeleteSopNode} from '../../Delete';
import {CoreEntity} from '../../../../../core/geometry/Entity';

export class ByExpressionHelper {
	constructor(private node: DeleteSopNode) {}
	async eval_for_entities(entities: CoreEntity[]) {
		const param = this.node.p.expression;
		if (this.node.p.expression.has_expression() && param.expression_controller) {
			await this.eval_expressions_for_points_with_expression(entities);
		} else {
			this.eval_expressions_without_expression(entities);
		}
	}

	private async eval_expressions_for_points_with_expression(entities: CoreEntity[]) {
		const param = this.node.p.expression;
		if (param.expression_controller) {
			await param.expression_controller.compute_expression_for_entities(entities, (entity, value) => {
				if (value) {
					this.node.entity_selection_helper.select(entity);
				}
			});
		}
	}
	private eval_expressions_without_expression(entities: CoreEntity[]) {
		const value = this.node.pv.expression;
		if (value) {
			for (let entity of entities) {
				this.node.entity_selection_helper.select(entity);
			}
		}
	}
}
