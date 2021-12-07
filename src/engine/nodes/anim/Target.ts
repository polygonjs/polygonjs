/**
 * Target of the animation
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';

export enum AnimTargetNodeTargetType {
	SCENE_GRAPH = 'scene graph',
	NODE = 'node',
}
const TARGET_TYPES: AnimTargetNodeTargetType[] = [AnimTargetNodeTargetType.SCENE_GRAPH, AnimTargetNodeTargetType.NODE];
const TARGET_TYPE_SCENE_GRAPH = TARGET_TYPES.indexOf(AnimTargetNodeTargetType.SCENE_GRAPH);
const TARGET_TYPE_NODE = TARGET_TYPES.indexOf(AnimTargetNodeTargetType.NODE);

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypeAssert} from '../../poly/Assert';
import {PropertyTarget} from '../../../core/animation/PropertyTarget';
import {AnimationUpdateCallback} from '../../../core/animation/UpdateCallback';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/BooleanValue';
class TargetAnimParamsConfig extends NodeParamsConfig {
	/** @param sets if the target is a Polygonjs node, or a THREE object */
	type = ParamConfig.INTEGER(TARGET_TYPE_SCENE_GRAPH, {
		menu: {
			entries: TARGET_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param if set to a Polygonjs node, this is the node path */
	nodePath = ParamConfig.OPERATOR_PATH('', {
		visibleIf: {type: TARGET_TYPE_NODE},
	});
	/** @param if set to a THREE object, this is a mask to find the objects */
	objectMask = ParamConfig.STRING('/geo*', {
		visibleIf: {type: TARGET_TYPE_SCENE_GRAPH},
	});
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1, {
		visibleIf: {type: TARGET_TYPE_SCENE_GRAPH},
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
	paramsConfig = ParamsConfig;
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
						case AnimTargetNodeTargetType.NODE:
							return this.pv.nodePath;
						case AnimTargetNodeTargetType.SCENE_GRAPH:
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
		timeline_builder.setTarget(target);
		this._set_update_callback(timeline_builder);

		this.setTimelineBuilder(timeline_builder);
	}
	setTargetType(targetType: AnimTargetNodeTargetType) {
		this.p.type.set(TARGET_TYPES.indexOf(targetType));
	}
	private _create_target(timeline_builder: TimelineBuilder) {
		const type = TARGET_TYPES[this.pv.type];
		switch (type) {
			case AnimTargetNodeTargetType.NODE: {
				return new PropertyTarget(this.scene(), {
					node: {
						path: this.pv.nodePath,
						relativeTo: this,
					},
				});
			}
			case AnimTargetNodeTargetType.SCENE_GRAPH: {
				return new PropertyTarget(this.scene(), {objectMask: this.pv.objectMask});
			}
		}
		TypeAssert.unreachable(type);
	}
	private _set_update_callback(timeline_builder: TimelineBuilder) {
		const type = TARGET_TYPES[this.pv.type];
		let update_callback = timeline_builder.updateCallback();
		switch (type) {
			case AnimTargetNodeTargetType.NODE: {
				return;
			}
			case AnimTargetNodeTargetType.SCENE_GRAPH: {
				if (isBooleanTrue(this.pv.updateMatrix)) {
					update_callback = update_callback || new AnimationUpdateCallback();
					update_callback.setUpdateMatrix(this.pv.updateMatrix);
					timeline_builder.setUpdateCallback(update_callback);
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
			case AnimTargetNodeTargetType.NODE: {
				return console.log(target.node());
			}
			case AnimTargetNodeTargetType.SCENE_GRAPH: {
				return console.log(target.objects());
			}
		}
	}
}
