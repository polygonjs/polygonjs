<template lang='pug'>

	include /mixins.pug

	doctype html

	.NumericSlider(
		v-if = 'display'
		:style = 'main_style_object'
		)
		.increment_starters_container(
			:class = 'starters_container_class_object'
			)
			.increment_starter.text-center(
				v-for = 'increment, i in increments'
				:class = 'increment_starter_class_objects[i]'
				@mouseenter = 'set_current_increment_index(i)'
			)
				.increment_label {{ increment }}
				.value_label(
					v-if = 'increment_starter_class_actives[i]'
				) {{ displayed_value }}


</template>

<script lang='ts'>
// third party lib
import lodash_isNumber from 'lodash/isNumber';
import lodash_concat from 'lodash/concat';

// internal lib
import {CoreDom} from 'src/core/Dom';
import {StoreController} from '../../store/controllers/StoreController';
import {ParamType} from '../../../engine/poly/ParamType';
import {BaseParamType} from '../../../engine/params/_Base';

const INTEGER_INCREMENTS = [100, 10, 1];
const FLOAT_INCREMENTS = [0.1, 0.01, 0.001, 0.0001];
const DIVIDER = 20;

import {ParamSetCommand} from '../../history/commands/ParamSet';
import {NumericParamValue} from '../../../engine/nodes/utils/params/ParamsController';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';

import {createComponent, ref, computed, watch} from '@vue/composition-api';
export default createComponent({
	name: 'numeric-slider',

	setup() {
		const new_value = ref<NumericParamValue | null>(null);
		const init_value = ref<NumericParamValue | null>(null);
		const current_increment_index = ref<number>(0);
		const start_x = ref<number | null>(null);
		const has_modified_param = ref(false);

		const param_id = computed(() => {
			return StoreController.editor.numeric_slider.param_id();
		});
		const json_param = computed(() => {
			if (param_id.value) {
				return StoreController.engine.json_param(param_id.value);
			}
		});
		const main_style_object = computed(() => {
			const position = StoreController.editor.numeric_slider.position();
			return {
				top: `${position.x}px`,
				left: `${position.y}px`,
			};
		});

		const display = computed(() => {
			return param_id.value != null;
		});
		const starters_container_class_object = computed(() => {
			if (is_param_integer.value == true) {
				return {
					integer: true,
				};
			} else {
				return {};
			}
		});
		let param: BaseParamType | undefined = undefined;
		watch(param_id, () => {
			if (param_id.value) {
				param = StoreController.scene.graph.node_from_id(param_id.value) as BaseParamType;
			} else {
				param = undefined;
			}
		});
		const is_param_integer = computed(() => {
			if (json_param.value) {
				return json_param.value['type'] == ParamType.INTEGER;
			}
		});
		const increments = computed(() => {
			if (is_param_integer.value) {
				return INTEGER_INCREMENTS;
			} else {
				return lodash_concat(INTEGER_INCREMENTS, FLOAT_INCREMENTS);
			}
		});
		const increment_starter_class_objects = computed(() => {
			return increments.value.map((increment, i) => {
				if (i == current_increment_index.value) {
					return {active: true};
				} else {
					return {inactive: true};
				}
			});
		});
		const increment_starter_class_actives = computed(() => {
			return increments.value.map((increment, i) => {
				return i == current_increment_index.value;
			});
		});
		const current_increment = computed(() => {
			return increments.value[current_increment_index.value];
		});
		const displayed_value = computed(() => {
			if (new_value.value != null) {
				if (lodash_isNumber(new_value.value)) {
					return new_value.value;
				} else {
					const val = new_value.value;
					if (
						val instanceof Color ||
						val instanceof Vector2 ||
						val instanceof Vector3 ||
						val instanceof Vector4
					) {
						return val.toArray().join('/');
					}
				}
			}
		});

		watch(display, async (new_display_value) => {
			if (new_display_value) {
				if (param) {
					await param.compute();
					const val = param.value;
					start_x.value = null;
					// not sure I need to test for isString, but just in case
					// removing string test, as it creates typings error
					if (lodash_isNumber(val) /*|| lodash_isString(val)*/) {
						init_value.value = val;
						// if (init_value.value == null) {
						// 	init_value.value = 0;
						// }
					} else {
						if (
							val instanceof Color ||
							val instanceof Vector2 ||
							val instanceof Vector3 ||
							val instanceof Vector4
						) {
							init_value.value = val.clone();
						}
					}
					// this.value = val
					set_events();
				} else {
					unset_events();
				}
			} else {
				unset_events();
			}
		});

		// function _is_value_multiple_numeric(val: ParamValue): boolean {
		// 	// const is_color = val instanceof Color;
		// 	// const is_vector2 = val instanceof Vector2;
		// 	// const is_vector3 = val instanceof Vector3;
		// 	// const is_vector4 = val instanceof Vector4;

		// 	// if(val instanceof Color){
		// 	// 	val.clone()
		// 	// }
		// 	return (val instanceof Color)
		// }

		// functions
		function set_events() {
			document.addEventListener('mousemove', _on_mouse_move);
			document.addEventListener('mouseup', _on_mouse_up);

			CoreDom.add_drag_classes();
			CoreDom.set_cursor_col_resize();
		}
		function unset_events() {
			document.removeEventListener('mousemove', _on_mouse_move);
			document.removeEventListener('mouseup', _on_mouse_up);

			CoreDom.remove_drag_classes();
			CoreDom.unset_cursor_col_resize();
		}
		function set_current_increment_index(i: number) {
			current_increment_index.value = i;
		}
		function _on_mouse_move(e: MouseEvent) {
			if (start_x.value == null) {
				start_x.value = e.clientX;
			}
			const pos_delta = e.clientX - start_x.value;
			const scaled_pos_delta = pos_delta / DIVIDER;
			const rounded_scaled_pos_delta = pos_delta > 0 ? Math.floor(scaled_pos_delta) : Math.ceil(scaled_pos_delta);

			if (Math.abs(rounded_scaled_pos_delta) >= 1 || has_modified_param.value == true) {
				let value_delta = rounded_scaled_pos_delta * current_increment.value;

				// try and round to avoid 0.000000000001 type of values
				if (current_increment.value < 1) {
					const increment_inverse = Math.floor(1 / current_increment.value);
					value_delta = Math.floor(value_delta * increment_inverse) / increment_inverse;
				}
				if (lodash_isNumber(init_value.value)) {
					new_value.value = init_value.value + value_delta;
				} else {
					const val = init_value.value;
					if (
						val instanceof Color ||
						val instanceof Vector2 ||
						val instanceof Vector3 ||
						val instanceof Vector4
					) {
						const new_vector = val.clone().addScalar(value_delta);
						new_value.value = new_vector; //.toArray();
					}
				}

				if (param) {
					param.set(new_value.value);
				}
				has_modified_param.value = true;
			}
		}
		function _on_mouse_up() {
			_close();
		}
		function _close() {
			if (param) {
				const cmd = new ParamSetCommand(param as any, new_value.value, init_value.value);
				cmd.push();
			}
			// close with a delay so that the on_paste in the field can prevent unwanted paste
			setTimeout(() => {
				StoreController.editor.numeric_slider.close();
			}, 25);
		}

		return {
			main_style_object,
			starters_container_class_object,
			increment_starter_class_objects,
			current_increment_index,
			increment_starter_class_actives,
			displayed_value,
			// functions
			set_current_increment_index,
		};
	},
});
</script>

<style lang='sass'>
	@import "globals.sass"

	$increment_cell_size: 50px
	$increment_cell_padding: 5px

	.NumericSlider
		position: absolute
		z-index: $z_index_numeric_slider
		width: 0px
		height: 0px
		.increment_starters_container
			position: absolute
			top: -3.5 * $increment_cell_size
			left: -0.5 * $increment_cell_size
			&.integer
				top: -2.5 * $increment_cell_size
			border: 1px solid white
			.increment_starter
				background-color: black
				color: white
				width: $increment_cell_size
				height: $increment_cell_size
				border-bottom: 1px solid white
				padding: $increment_cell_padding
				&:hover, &.active
					background-color: yellow
					color: black
				&.inactive
					.increment_label
						top: 2 * $increment_cell_padding
				.increment_label, .value_label
					position: relative
					font-size: 0.7rem
				.value_label
					top: $increment_cell_padding

		

</style>
