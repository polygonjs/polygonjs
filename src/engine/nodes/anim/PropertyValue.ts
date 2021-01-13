/**
 * Value of the property the animation will be animated to
 *
 *
 */
import {TypedAnimNode} from './_Base';
import {TimelineBuilder} from '../../../core/animation/TimelineBuilder';
import {CoreType} from '../../../core/Type';
import {TypeAssert} from '../../poly/Assert';
import {CoreString} from '../../../core/String';
import {Object3D} from 'three/src/core/Object3D';
import {Quaternion} from 'three/src/math/Quaternion';

enum PropertyValueMode {
	CUSTOM = 'custom',
	FROM_SCENE_GRAPH = 'from scene graph',
	FROM_NODE = 'from node',
}
const PROPERTY_VALUE_MODES: PropertyValueMode[] = [
	PropertyValueMode.CUSTOM,
	PropertyValueMode.FROM_SCENE_GRAPH,
	PropertyValueMode.FROM_NODE,
];
const PROPERTY_VALUE_MODE_CUSTOM = PROPERTY_VALUE_MODES.indexOf(PropertyValueMode.CUSTOM);
const PROPERTY_VALUE_MODE_FROM_SCENE_GRAPH = PROPERTY_VALUE_MODES.indexOf(PropertyValueMode.FROM_SCENE_GRAPH);
const PROPERTY_VALUE_MODE_FROM_NODE = PROPERTY_VALUE_MODES.indexOf(PropertyValueMode.FROM_NODE);

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PropertyValueAnimParamsConfig extends NodeParamsConfig {
	/** @param mode */
	mode = ParamConfig.INTEGER(PROPERTY_VALUE_MODE_CUSTOM, {
		menu: {
			entries: PROPERTY_VALUE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param if set to a Polygonjs node, this is the node path */
	nodePath = ParamConfig.NODE_PATH('/geo1', {
		visibleIf: {mode: PROPERTY_VALUE_MODE_FROM_NODE},
	});
	/** @param if set to a THREE object, this is a mask to find the objects */
	objectMask = ParamConfig.STRING('/geo1', {
		visibleIf: {mode: PROPERTY_VALUE_MODE_FROM_SCENE_GRAPH},
	});
	overridePropertyName = ParamConfig.BOOLEAN(0, {
		visibleIf: [{mode: PROPERTY_VALUE_MODE_FROM_SCENE_GRAPH}, {mode: PROPERTY_VALUE_MODE_FROM_NODE}],
	});
	propertyName = ParamConfig.STRING('', {
		visibleIf: [
			{overridePropertyName: true, mode: PROPERTY_VALUE_MODE_FROM_SCENE_GRAPH},
			{overridePropertyName: true, mode: PROPERTY_VALUE_MODE_FROM_NODE},
		],
	});
	/** @param size of the parameter to animate */
	size = ParamConfig.INTEGER(3, {
		range: [1, 4],
		rangeLocked: [true, true],
		visibleIf: {mode: PROPERTY_VALUE_MODE_CUSTOM},
	});
	/** @param value for a float */
	value1 = ParamConfig.FLOAT(0, {
		visibleIf: {mode: PROPERTY_VALUE_MODE_CUSTOM, size: 1},
	});
	/** @param value for a vector2 */
	value2 = ParamConfig.VECTOR2([0, 0], {
		visibleIf: {mode: PROPERTY_VALUE_MODE_CUSTOM, size: 2},
	});
	/** @param value for a vector3 */
	value3 = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {mode: PROPERTY_VALUE_MODE_CUSTOM, size: 3},
	});
	/** @param value for a vector4 */
	value4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visibleIf: {mode: PROPERTY_VALUE_MODE_CUSTOM, size: 4},
	});
}
const ParamsConfig = new PropertyValueAnimParamsConfig();

export class PropertyValueAnimNode extends TypedAnimNode<PropertyValueAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'propertyValue';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
	}

	async cook(input_contents: TimelineBuilder[]) {
		const timeline_builder = input_contents[0] || new TimelineBuilder();

		await this._prepare_timeline_builder(timeline_builder);
		this.set_timeline_builder(timeline_builder);
	}

	private async _prepare_timeline_builder(timeline_builder: TimelineBuilder) {
		const mode = PROPERTY_VALUE_MODES[this.pv.mode];
		switch (mode) {
			case PropertyValueMode.CUSTOM: {
				return this._prepare_timebuilder_custom(timeline_builder);
			}
			case PropertyValueMode.FROM_SCENE_GRAPH: {
				return this._prepare_timebuilder_from_scene_graph(timeline_builder);
			}
			case PropertyValueMode.FROM_NODE: {
				return await this._prepare_timebuilder_from_node(timeline_builder);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _prepare_timebuilder_custom(timeline_builder: TimelineBuilder) {
		const target_value = [this.pv.value1, this.pv.value2.clone(), this.pv.value3.clone(), this.pv.value4.clone()][
			this.pv.size - 1
		];
		timeline_builder.setPropertyValue(target_value);
	}
	private _prepare_timebuilder_from_scene_graph(timeline_builder: TimelineBuilder) {
		const property_name = this.pv.overridePropertyName ? this.pv.propertyName : timeline_builder.propertyName();

		if (!property_name) {
			return;
		}

		const mask = this.pv.objectMask;
		let found_object: Object3D | undefined = undefined;
		try {
			this.scene()
				.threejsScene()
				.traverse((object) => {
					if (CoreString.matchMask(object.name, mask)) {
						found_object = object;
						// we throw an exception here to not have to traverse the whole scene
						throw 'found object';
					}
				});
		} catch (error) {
			if (found_object) {
				const value: any = found_object[property_name as keyof Object3D];
				if (value) {
					if (CoreType.isNumber(value) || CoreType.isVector(value) || value instanceof Quaternion) {
						timeline_builder.setPropertyValue(value);
					}
				}
			}
		}
	}

	private async _prepare_timebuilder_from_node(timeline_builder: TimelineBuilder) {
		const property_name = this.pv.overridePropertyName ? this.pv.propertyName : timeline_builder.propertyName();
		if (!property_name) {
			return;
		}
		const node = this.pv.nodePath.node();
		if (!node) {
			return;
		}
		const param = node.params.get(property_name);
		if (!param) {
			return;
		}
		if (param.isDirty()) {
			await param.compute();
		}
		const value = param.value;
		if (value) {
			if (CoreType.isNumber(value) || CoreType.isVector(value)) {
				timeline_builder.setPropertyValue(value);
			}
		}
	}
}
