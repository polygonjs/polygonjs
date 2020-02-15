import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {computed, Ref} from '@vue/composition-api';
export function SetupCommentable(
	json_node: EngineNodeData,
	body_size: Readonly<
		Ref<
			Readonly<{
				x: number;
				y: number;
			}>
		>
	>,
	layout_vertical: Readonly<Ref<boolean>>
) {
	const comment = computed(() => {
		return json_node.ui_data_json.comment;
	});
	const display_comment = computed(() => {
		return comment.value != null && comment.value != '';
	});
	const comment_container_style_object = computed(() => {
		if (layout_vertical.value) {
			return {
				left: `${0.5 * body_size.value.x}px`,
				top: `${0.5 * body_size.value.y}px`,
			};
		} else {
			return {
				left: `${-0.5 * body_size.value.x}px`,
				top: `${-0.5 * body_size.value.y}px`,
			};
		}
	});

	return {
		display_comment,
		comment,
		comment_container_style_object,
	};
}
