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
		type: Number,
		default: -1,
	},
	displays_expression_result: {
		type: Boolean,
		default: false,
	},
};
export interface ISetupFieldCommonProps {
	json_param: EngineParamData;
	tabindex: number;
	displays_expression_result: boolean;
}

import {computed, watch} from '@vue/composition-api';
import {ParamSetCommand} from 'src/editor/history/commands/ParamSet';
export function SetupFieldCommon(props: ISetupFieldCommonProps) {
	const param = StoreController.engine.param(props.json_param.graph_node_id)!;

	// param() {
	// 	return $store.scene.graph().node_from_id(json_param != null ? json_param.graph_node_id : undefined);
	// },
	const name = computed(() => {
		return props.json_param.name;
	});

	const raw_input = computed(() => {
		return props.json_param.raw_input;
	});
	const value = computed(() => {
		return props.json_param.value;
	});
	const expression = computed(() => {
		return props.json_param.expression;
	});
	const has_expression = computed(() => {
		return expression.value != null;
	});
	const error_message = computed(() => {
		return props.json_param.error_message;
	});
	const is_errored = computed(() => {
		return error_message.value != null;
	});
	// const is_dirty = computed(() => {
	// 	return json_param.is_dirty;
	// });

	const field_component_type = computed(() => {
		return props.json_param.type;
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
		return {displays_expression_result: props.displays_expression_result};
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
	const displays_expression_result_computed = computed(() => {
		return props.displays_expression_result;
	});

	watch(displays_expression_result_computed, async (new_display, old_display) => {
		if (new_display) {
			await param.compute();
		}
	});

	// functions
	function on_update_value(e: Event) {
		const target = e.currentTarget as HTMLInputElement | null;
		if (target) {
			const new_value = target.value;
			if (!param.is_raw_input_equal(new_value)) {
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
		raw_input,
		has_expression,
		error_message,
		is_errored,
		// is_dirty,
		field_component_type,
		class_object,
		input_value_class_object,
		is_field_visible,
		// functions
		on_update_value,
		// on_wheel,
		reset_to_default,
	};
}
