import {BaseParam} from 'src/engine/params/_Base';
import {CorePoint} from 'src/core/geometry/Point';

import {ExpressionController} from 'src/engine/expressions/ExpressionController';
// import {DependenciesController} from 'src/Engine/Expression/DependenciesController'

type EntityCallback = (entity: CorePoint, value: number) => void;

export function Expression<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseParam = (<unknown>this) as BaseParam;
		protected _expression: string | null = null;
		private expression_controller: ExpressionController | null = null;

		private _entities: CorePoint[] | null;
		private _entity_callback: EntityCallback | null;

		set_expression(string: string | null) {
			if (string === null && !this.has_expression()) {
				return;
			}
			if (string === this._expression && this.has_expression()) {
				return;
			}

			const cooker = this.self.scene.cooker;
			cooker.block();

			this.self.states.error.clear();
			// this.self.reset_parsed_expression();
			this._expression = string;
			// this._expression_valid = false
			// this._parse_expression_completed = false
			this._expression_controller().reset();
			if (this.self.scene.loading_controller.loaded && this._expression) {
				this._expression_controller().parse_and_update_dependencies(this._expression);
			}

			this.self.set_dirty();
			cooker.unblock();
			this.self.emit_controller.emit_param_updated();
		}
		remove_expression() {
			this.set_expression(null);
		}
		expression() {
			return this._expression;
		}
		has_expression(): boolean {
			return this._expression !== null;
		}
		// set_entity(entity){
		// 	this._entity = entity
		// 	const components = this.self.components()
		// 	if(components){
		// 		for(let i=0; i<components.length; i++){
		// 			components[i].set_entity(entity)
		// 		}
		// 	}

		// 	this.self.invalidates_result()
		// 	// this.set_dirty()
		// }
		// entity() {
		// 	return this.self.node.context().entity();
		// }
		entities() {
			return this._entities;
		}
		entity_callback() {
			return this._entity_callback;
		}
		set_entities(entities: CorePoint[], callback: EntityCallback) {
			this._entities = entities;
			this._entity_callback = callback;
		}
		reset_entities() {
			this._entities = null;
			this._entity_callback = null;
		}
		// entity_attrib_value(attrib_name: string, target) {
		// 	const entity = this.entity()
		// 	if (entity) {
		// 		if (target) {
		// 			entity.attrib_value(attrib_name, target)
		// 		} else {
		// 			const val = entity.attrib_value(attrib_name, target)
		// 			return val
		// 		}
		// 	} else {
		// 		return this.self._default_value
		// 	}
		// }
		async eval_expression_for_entities(
			entities: CorePoint[],
			callback: (entity: CorePoint, value: number) => void
		) {
			this.set_entities(entities, callback);
			if (this._expression) {
				await this.eval_raw_expression();
			}

			this.reset_entities();
		}

		// private parse_expression_and_update_dependencies_if_not_done(){
		// 	if(!this._parse_expression_completed){
		// 		this.parse_expression_and_update_dependencies()
		// 		this._parse_expression_completed = true
		// 	}
		// }

		// parse_expression_and_update_dependencies(){
		// 	if(this._expression){
		// 		this.expression_controller = this.expression_controller || new ExpressionController(this.self)

		// 		this.expression_controller.parse_expression(this._expression)

		// 		if( this.expression_controller.error_message != null ){
		// 			this.self.set_error(`expression error: "${this._expression}" (${this.expression_controller.error_message})`)
		// 		}

		// 	}
		// }

		protected async eval_raw_expression(): Promise<any> {
			// this.parse_expression_and_update_dependencies_if_not_done()
			if (this._expression) {
				let value = await this._expression_controller().eval_function(this._expression);

				if (value != null) {
					// value = this.self.convert_value(value) // TODO: typescript
				}
				return value;
			}
		}

		_expression_controller() {
			return (this.expression_controller = this.expression_controller || new ExpressionController(this.self));
		}

		update_expression_from_method_dependency_name_change() {
			this.expression_controller?.update_from_method_dependency_name_change();
			// await this.eval_p()
		}
	};
}
