import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

enum TargetType {
	SCENE_GRAPH = 'scene graph',
	NODE = 'node',
}
const TARGET_TYPES: TargetType[] = [TargetType.SCENE_GRAPH, TargetType.NODE];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypeAssert} from '../../poly/Assert';
import {PropertyTarget} from '../../../core/animation/PropertyTarget';
class TargetAnimParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: TARGET_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	node_path = ParamConfig.OPERATOR_PATH('/geo1', {
		visible_if: {type: TARGET_TYPES.indexOf(TargetType.NODE)},
	});
	object_mask = ParamConfig.STRING('/geo1', {
		visible_if: {type: TARGET_TYPES.indexOf(TargetType.SCENE_GRAPH)},
	});
}
const ParamsConfig = new TargetAnimParamsConfig();

export class TargetAnimNode extends TypedAnimNode<TargetAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'target';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);

		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.type, this.p.node_path, this.p.object_mask], () => {
					const type = TARGET_TYPES[this.pv.type];
					switch (type) {
						case TargetType.NODE:
							return this.pv.node_path;
						case TargetType.SCENE_GRAPH:
							return this.pv.object_mask;
					}
					TypeAssert.unreachable(type);
				});
			});
		});
	}

	cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		const target = this._create_target(timeline_builder);
		timeline_builder.set_target(target);

		this.set_timeline_builder(timeline_builder);
	}
	private _create_target(timeline_builder: TimelineBuilder) {
		const type = TARGET_TYPES[this.pv.type];
		const property_target = new PropertyTarget();
		switch (type) {
			case TargetType.NODE: {
				property_target.set_node_path(this.pv.node_path);
				return property_target;
			}
			case TargetType.SCENE_GRAPH: {
				property_target.set_object_mask(this.pv.object_mask);
				return property_target;
			}
		}
		TypeAssert.unreachable(type);
	}
}
