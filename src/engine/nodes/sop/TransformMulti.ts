import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreTransform, ROTATION_ORDERS, RotationOrder} from '../../../core/Transform';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Vector3} from 'three/src/math/Vector3';
import {ParamOptions, MenuParamOptions, VisibleIfParamOptions} from '../../params/utils/OptionsController';

const max_transform_count = 6;
const ROT_ORDER_DEFAULT = ROTATION_ORDERS.indexOf(RotationOrder.XYZ);
const ROT_ORDER_MENU_ENTRIES: MenuParamOptions = {
	menu: {
		entries: ROTATION_ORDERS.map((order, v) => {
			return {name: order, value: v};
		}),
	},
};
function visible_for_count(count: number): ParamOptions {
	const list: VisibleIfParamOptions[] = [];
	for (let i = count + 1; i <= max_transform_count; i++) {
		list.push({
			count: i,
		});
	}
	return {visible_if: list};
}

type VectorNumberParamPair = [Vector3Param, IntegerParam];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {IntegerParam} from '../../params/Integer';
import {Vector3Param} from '../../params/Vector3';
class TransformMultiSopParamConfig extends NodeParamsConfig {
	count = ParamConfig.INTEGER(2, {
		range: [0, max_transform_count],
		range_locked: [true, true],
	});
	// 0
	rotation_order0 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(0),
	});
	r0 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(0)});
	sep0 = ParamConfig.SEPARATOR(null, {...visible_for_count(0)});
	// 1
	rotation_order1 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(1),
	});
	r1 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(1)});
	sep1 = ParamConfig.SEPARATOR(null, {...visible_for_count(1)});
	// 2
	rotation_order2 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(2),
	});
	r2 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(2)});
	sep2 = ParamConfig.SEPARATOR(null, {...visible_for_count(2)});
	// 3
	rotation_order3 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(3),
	});
	r3 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(3)});
	sep3 = ParamConfig.SEPARATOR(null, {...visible_for_count(3)});
	// 4
	rotation_order4 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(4),
	});
	r4 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(4)});
	sep4 = ParamConfig.SEPARATOR(null, {...visible_for_count(4)});
	// 5
	rotation_order5 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(5),
	});
	r5 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(5)});
	sep5 = ParamConfig.SEPARATOR(null, {...visible_for_count(5)});
}
const ParamsConfig = new TransformMultiSopParamConfig();

export class TransformMultiSopNode extends TypedSopNode<TransformMultiSopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'transform_multi';
	}

	static displayed_input_names(): string[] {
		return ['objects to transform', 'objects to copy initial transform from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1, 2);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	private _core_transform = new CoreTransform();
	private _rot_and_index_pairs: VectorNumberParamPair[] | undefined;
	cook(input_contents: CoreGroup[]) {
		const objects = input_contents[0].objects();
		const src_object = input_contents[1] ? input_contents[1].objects()[0] : undefined;

		this._rot_and_index_pairs = this._rot_and_index_pairs || [
			[this.p.r0, this.p.rotation_order0],
			[this.p.r1, this.p.rotation_order1],
			[this.p.r2, this.p.rotation_order2],
			[this.p.r3, this.p.rotation_order3],
			[this.p.r4, this.p.rotation_order4],
			[this.p.r5, this.p.rotation_order5],
		];

		if (src_object) {
			for (let object of objects) {
				object.matrix.copy(src_object.matrix);
				object.matrix.decompose(object.position, object.quaternion, object.scale);
			}
		}

		let pair: VectorNumberParamPair;
		for (let i = 0; i < this.pv.count; i++) {
			pair = this._rot_and_index_pairs[i];
			const matrix = this._matrix(pair[0].value, pair[1].value);
			for (let object of objects) {
				object.applyMatrix4(matrix);
			}
		}

		this.set_objects(objects);
	}

	private _t = new Vector3(0, 0, 0);
	private _s = new Vector3(1, 1, 1);
	private _scale = 1;
	private _matrix(r: Vector3, rot_order_index: number) {
		return this._core_transform.matrix(this._t, r, this._s, this._scale, ROTATION_ORDERS[rot_order_index]);
	}
}
