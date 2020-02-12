import {EngineParamData} from 'src/editor/store/modules/Engine';
import {ParamSetCommand} from 'src/editor/history/commands/ParamSet';
import {BaseParamType} from 'src/engine/params/_Base';
import {ParamValue} from 'src/engine/nodes/utils/params/ParamsController';
export function SetupNumericSlider(json_param: EngineParamData, param: BaseParamType) {
	let slider_start_value: ParamValue | undefined = undefined;
	let slider_start_expression: string | undefined = undefined;
	function on_slider_mousedown(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			if (param.has_expression() && param.expression_controller) {
				slider_start_expression = param.expression_controller.expression;
			} else {
				slider_start_value = param.value;
			}
		}
	}
	function on_slider_mouseup(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			if (slider_start_expression) {
				const cmd = new ParamSetCommand(param as any, param.value, slider_start_expression);
				cmd.push();
			} else {
				if (!param.is_value_equal(slider_start_value as any)) {
					const cmd = new ParamSetCommand(param as any, param.value, slider_start_value);
					cmd.push();
				}
			}
			slider_start_value = undefined;
			slider_start_expression = undefined;
		}
	}
	function on_slider_drag(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			const value = target.value;
			if (!param.is_value_equal(value as any)) {
				param.set(value);
			}
		}
	}
	function on_slider_change(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
		}
	}

	return {
		on_slider_mousedown,
		on_slider_mouseup,
		on_slider_drag,
		on_slider_change,
	};
}
