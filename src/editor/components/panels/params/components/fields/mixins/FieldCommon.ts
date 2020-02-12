import {StoreController} from 'src/editor/store/controllers/StoreController';
import {EngineParamData} from 'src/editor/store/modules/Engine';

export const SetupFieldCommonProps = {
	json_param: {
		type: Object,
		default() {
			return {};
		},
	},
	tabindex: {
		default: -1,
		type: Number,
	},
};
export interface ISetupFieldCommonProps {
	json_param: EngineParamData;
	tabindex: number;
}

import {computed, ref, watch} from '@vue/composition-api';
import {ParamSetCommand} from 'src/editor/history/commands/ParamSet';
export function SetupFieldCommon(json_param: EngineParamData) {
	const param = StoreController.engine.param(json_param.graph_node_id)!;
	const displays_expression_result = ref(false);

	// param() {
	// 	return $store.scene.graph().node_from_id(json_param != null ? json_param.graph_node_id : undefined);
	// },
	const name = computed(() => {
		return json_param.name;
	});

	const value = computed(() => {
		return json_param.value;
	});
	const expression = computed(() => {
		return json_param.expression;
	});
	const has_expression = computed(() => {
		return expression.value != null;
	});
	const value_or_expression = computed(() => {
		return has_expression.value ? expression.value : value.value;
	});
	const error_message = computed(() => {
		return json_param.error_message;
	});
	const is_errored = computed(() => {
		return error_message.value != null;
	});
	// const is_dirty = computed(() => {
	// 	return json_param.is_dirty;
	// });

	const field_component_type = computed(() => {
		return json_param.type;
	});

	const class_object = computed(() => {
		// TODO: no idea why this gets called forever for a string
		// if (param.options.displays_expression_only === true) {
		// 	if (is_dirty) {
		// 		param.eval((value) => {
		// 			return console.log(value, json_param.result);
		// 		});
		// 	}
		// 	return (object = {
		// 		displays_expression_result: true,
		// 		displays_expression_only: true,
		// 	});
		// } else {
		return {displays_expression_result: displays_expression_result.value};
		// }
	});

	const input_value_class_object = computed(() => {
		return {
			has_expression: has_expression.value,
			is_errored: is_errored.value,
		};
	});

	const is_field_visible = computed(() => {
		return !param.options.is_field_hidden();
	});

	watch(displays_expression_result, async (new_display, old_display) => {
		if (new_display) {
			await param.compute();
		}
	});

	// functions
	function on_update_value(e: Event) {
		const target = e.currentTarget as HTMLInputElement | null;
		if (target) {
			const new_value = target.value;
			if (!param.is_value_equal(new_value)) {
				create_set_command(target.value);
			}
		}
	}

	// NOT USED, since it is annoying when trying to scroll
	// function on_wheel(e: WheelEvent) {
	// 	if (has_expression.value) {
	// 		return;
	// 	}

	// 	const type = field_component_type.value;
	// 	if (type == ParamType.FLOAT || type == ParamType.INTEGER) {
	// 		const down = e.deltaY > 0;
	// 		let offset = 0.1;
	// 		if (down) {
	// 			offset *= -1;
	// 		}
	// 		param.set(((<any>value) as number) + offset);
	// 	}
	// 	// TODO: how can I generate a command only when the mouse wheel has stopped?
	// }

	function reset_to_default() {
		if (!param.is_default) {
			create_set_command(param.default_value);
		}
	}
	function create_set_command(value: any) {
		const cmd = new ParamSetCommand(param as any, value);
		cmd.push();
	}

	return {
		name,
		value,
		expression,
		value_or_expression,
		has_expression,
		error_message,
		is_errored,
		// is_dirty,
		field_component_type,
		class_object,
		input_value_class_object,
		is_field_visible,
		displays_expression_result,
		// functions
		on_update_value,
		// on_wheel,
		reset_to_default,
	};
}
