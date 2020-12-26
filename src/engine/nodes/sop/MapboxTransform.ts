/**
 * Transforms a geometry from the world space to the mapbox space
 *
 * @remarks
 * The mapbox space is very specific to mapbox, as it is very small (several orders of magnitude) compared to the threejs space.
 */
import {CoreMapboxTransform} from '../../../core/mapbox/Transform';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {MapboxListenerParamConfig, MapboxListenerSopNode} from './utils/mapbox/MapboxListener';

const INPUT_NAMES = ['points to transform in mapbox space'];

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class MapboxTransformSopParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {}
const ParamsConfig = new MapboxTransformSopParamsConfig();

export class MapboxTransformSopNode extends MapboxListenerSopNode<MapboxTransformSopParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'mapboxTransform';
	}

	static displayed_input_names(): string[] {
		return INPUT_NAMES;
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);

		// this.uiData.set_icon("map-marker-alt");
		// this._init_mapbox_listener();
	}

	cook(input_contents: CoreGroup[]) {
		if (!this._camera_node) {
			this.update_mapbox_camera();
			if (!this._camera_node) {
				this.states.error.set('mapbox camera not found');
				return;
			}
		}

		// No need to error here, as it would prevent scene.wait_all_cooks()
		// to complete in the export
		// if (!this._camera_node.first_map()) {
		// 	this.states.error.set('mapbox not yet loaded');
		// 	return;
		// }

		const core_group = input_contents[0];
		this.transform_input(core_group);
	}

	transform_input(core_group: CoreGroup) {
		if (this._camera_node) {
			const transformer = new CoreMapboxTransform(this._camera_node);
			for (let object of core_group.objects()) {
				transformer.transform_group_FINAL(object);
			}
		} else {
			this.states.error.set('no camera node found');
		}
		this.set_core_group(core_group);
	}

	_post_init_controller() {}
}
