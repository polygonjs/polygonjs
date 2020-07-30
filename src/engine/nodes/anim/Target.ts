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
import {AnimationUpdateCallback} from '../../../core/animation/UpdateCallback';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
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
	object_mask = ParamConfig.STRING('/geo*', {
		visible_if: {type: TARGET_TYPES.indexOf(TargetType.SCENE_GRAPH)},
	});
	update_matrix = ParamConfig.BOOLEAN(0, {
		visible_if: {type: TARGET_TYPES.indexOf(TargetType.SCENE_GRAPH)},
	});
	print_resolve = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			TargetAnimNode.PARAM_CALLBACK_print_resolve(node as TargetAnimNode);
		},
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
		this._set_update_callback(timeline_builder);

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
	private _set_update_callback(timeline_builder: TimelineBuilder) {
		const type = TARGET_TYPES[this.pv.type];
		let update_callback = timeline_builder.update_callback();
		switch (type) {
			case TargetType.NODE: {
				return;
			}
			case TargetType.SCENE_GRAPH: {
				if (this.pv.update_matrix) {
					update_callback = update_callback || new AnimationUpdateCallback();
					update_callback.set_update_matrix(this.pv.update_matrix);
					timeline_builder.set_update_callback(update_callback);
				}
				return;
			}
		}
		TypeAssert.unreachable(type);
	}

	static PARAM_CALLBACK_print_resolve(node: TargetAnimNode) {
		node.print_resolve();
	}
	private print_resolve() {
		const type = TARGET_TYPES[this.pv.type];
		const timeline_builder = new TimelineBuilder();
		const target = this._create_target(timeline_builder);
		switch (type) {
			case TargetType.NODE: {
				return console.log(target.node(this.scene));
			}
			case TargetType.SCENE_GRAPH: {
				return console.log(target.objects(this.scene));
			}
		}
	}
}
