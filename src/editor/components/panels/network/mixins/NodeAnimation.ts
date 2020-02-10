import {Ref, onMounted} from '@vue/composition-api';
import {NodeAnimationHelper} from '../helpers/NodeAnimation';
export function SetupNodeAnimation(
	node_animation_helper: NodeAnimationHelper,
	nodes_container: Ref<HTMLElement | null>
) {
	onMounted(() => {
		if (nodes_container.value) {
			node_animation_helper.set_element(nodes_container.value);
		}
	});

	return {};
}
