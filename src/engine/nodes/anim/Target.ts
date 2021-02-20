/**
 * Target of the animation
 *
 *
 */
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
import {isBooleanTrue} from '../../../core/BooleanValue';
class TargetAnimParamsConfig extends NodeParamsConfig {
	/** @param sets if the target is a Polygonjs node, or a THREE object */
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: TARGET_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param if set to a Polygonjs node, this is the node path */
	nodePath = ParamConfig.OPERATOR_PATH('/geo1', {
		visibleIf: {type: TARGET_TYPES.indexOf(TargetType.NODE)},
	});
	/** @param if set to a THREE object, this is a mask to find the objects */
	objectMask = ParamConfig.STRING('/geo*', {
		visibleIf: {type: TARGET_TYPES.indexOf(TargetType.SCENE_GRAPH)},
	});
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(0, {
		visibleIf: {type: TARGET_TYPES.indexOf(TargetType.SCENE_GRAPH)},
	});
	/** @param prints which objects are targeted by this node, for debugging */
	printResolve = ParamConfig.BUTTON(null, {
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

	initializeNode() {
		this.io.inputs.setCount(0, 1);

		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.type, this.p.nodePath, this.p.objectMask], () => {
					const type = TARGET_TYPES[this.pv.type];
					switch (type) {
						case TargetType.NODE:
							return this.pv.nodePath;
						case TargetType.SCENE_GRAPH:
							return this.pv.objectMask;
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
				property_target.set_node_path(this.pv.nodePath);
				return property_target;
			}
			case TargetType.SCENE_GRAPH: {
				property_target.set_object_mask(this.pv.objectMask);
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
				if (isBooleanTrue(this.pv.updateMatrix)) {
					update_callback = update_callback || new AnimationUpdateCallback();
					update_callback.set_update_matrix(this.pv.updateMatrix);
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
				return console.log(target.node(this.scene()));
			}
			case TargetType.SCENE_GRAPH: {
				return console.log(target.objects(this.scene()));
			}
		}
	}
}
