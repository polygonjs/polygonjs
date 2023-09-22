/**
 * Applies multiple rotations with one node
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {
	CoreTransform,
	ROTATION_ORDERS,
	RotationOrder,
	TransformTargetType,
	TRANSFORM_TARGET_TYPES,
} from '../../../core/Transform';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Vector3} from 'three';
import {ParamOptions, MenuNumericParamOptions, VisibleIfParamOptions} from '../../params/utils/OptionsController';

const max_transform_count = 6;
const ROT_ORDER_DEFAULT = ROTATION_ORDERS.indexOf(RotationOrder.XYZ);
const ROT_ORDER_MENU_ENTRIES: MenuNumericParamOptions = {
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
	return {
		visibleIf: list,
	};
}

type VectorNumberParamPair = [Vector3Param, IntegerParam];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {IntegerParam} from '../../params/Integer';
import {Vector3Param} from '../../params/Vector3';
import {TypeAssert} from '../../poly/Assert';
import {Object3D} from 'three';
import {BufferAttribute} from 'three';
import {CoreAttribute, Attribute} from '../../../core/geometry/Attribute';
import {SopType} from '../../poly/registers/nodes/types/Sop';
class TransformMultiSopParamConfig extends NodeParamsConfig {
	/** @param defines if this applies to objects or geometries */
	applyOn = ParamConfig.INTEGER(TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.GEOMETRY), {
		menu: {
			entries: TRANSFORM_TARGET_TYPES.map((target_type, i) => {
				return {name: target_type, value: i};
			}),
		},
	});
	/** @param number of transformations this can apply */
	count = ParamConfig.INTEGER(2, {
		range: [0, max_transform_count],
		rangeLocked: [true, true],
	});

	// 0
	/** @param transform 0 rotation order */
	rotationOrder0 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		separatorBefore: true,
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(0),
	});
	/** @param rotation 0 */
	r0 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(0)});

	// 1
	/** @param transform 1 rotation order */
	rotationOrder1 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		separatorBefore: true,
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(1),
	});
	/** @param rotation 1 */
	r1 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(1)});

	// 2
	/** @param transform 2 rotation order */
	rotationOrder2 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		separatorBefore: true,
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(2),
	});
	/** @param rotation 2 */
	r2 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(2)});

	// 3
	/** @param transform 3 rotation order */
	rotationOrder3 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		separatorBefore: true,
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(3),
	});
	/** @param rotation 3 */
	r3 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(3)});

	// 4
	/** @param transform 4 rotation order */
	rotationOrder4 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		separatorBefore: true,
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(4),
	});
	/** @param rotation 4 */
	r4 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(4)});

	// 5
	/** @param transform 5 rotation order */
	rotationOrder5 = ParamConfig.INTEGER(ROT_ORDER_DEFAULT, {
		separatorBefore: true,
		...ROT_ORDER_MENU_ENTRIES,
		...visible_for_count(5),
	});
	/** @param rotation 5 */
	r5 = ParamConfig.VECTOR3([0, 0, 0], {...visible_for_count(5)});
}
const ParamsConfig = new TransformMultiSopParamConfig();

export class TransformMultiSopNode extends TypedSopNode<TransformMultiSopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TRANSFORM_MULTI;
	}

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	private _core_transform = new CoreTransform();
	private __rotAndIndexPairs: VectorNumberParamPair[] | undefined;
	private _createRotAndIndexPairs(): VectorNumberParamPair[] {
		return [
			[this.p.r0, this.p.rotationOrder0],
			[this.p.r1, this.p.rotationOrder1],
			[this.p.r2, this.p.rotationOrder2],
			[this.p.r3, this.p.rotationOrder3],
			[this.p.r4, this.p.rotationOrder4],
			[this.p.r5, this.p.rotationOrder5],
		];
	}
	private _rotAndIndexPairs() {
		return (this.__rotAndIndexPairs = this.__rotAndIndexPairs || this._createRotAndIndexPairs());
	}
	override cook(input_contents: CoreGroup[]) {
		const objects = input_contents[0].threejsObjectsWithGeo();
		const src_object = input_contents[1] ? input_contents[1].threejsObjectsWithGeo()[0] : undefined;

		this._apply_transforms(objects, src_object);

		this.setObjects(objects);
	}

	private _apply_transforms(objects: Object3DWithGeometry[], src_object: Object3DWithGeometry | undefined) {
		const mode = TRANSFORM_TARGET_TYPES[this.pv.applyOn];
		switch (mode) {
			case TransformTargetType.GEOMETRY: {
				return this._apply_matrix_to_geometries(objects, src_object);
			}
			case TransformTargetType.OBJECT: {
				return this._apply_matrix_to_objects(objects, src_object);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _apply_matrix_to_geometries(objects: Object3DWithGeometry[], src_object: Object3DWithGeometry | undefined) {
		if (src_object) {
			const src_geometry = src_object.geometry;
			if (src_geometry) {
				const attributes_to_copy = [Attribute.POSITION, Attribute.NORMAL, Attribute.TANGENT];

				for (const attrib_name of attributes_to_copy) {
					const src = src_geometry.attributes[attrib_name] as BufferAttribute | null;
					for (const object of objects) {
						const geometry = object.geometry;
						const dest = geometry.attributes[attrib_name] as BufferAttribute | null;
						if (src && dest) {
							CoreAttribute.copy(src, dest);
						}
					}
				}
			}
		}

		let pair: VectorNumberParamPair;
		for (let i = 0; i < this.pv.count; i++) {
			pair = this._rotAndIndexPairs()[i];
			const matrix = this._matrix(pair[0].value, pair[1].value);
			for (const object of objects) {
				object.geometry.applyMatrix4(matrix);
			}
		}
	}

	private _apply_matrix_to_objects(objects: Object3D[], src_object: Object3D | undefined) {
		if (src_object) {
			for (const object of objects) {
				object.matrix.copy(src_object.matrix);
				// TODO: This would not be required if objects generated in SOP has matrixAutoUpdate=false
				object.matrix.decompose(object.position, object.quaternion, object.scale);
			}
		}

		let pair: VectorNumberParamPair;
		for (let i = 0; i < this.pv.count; i++) {
			pair = this._rotAndIndexPairs()[i];
			const matrix = this._matrix(pair[0].value, pair[1].value);
			for (const object of objects) {
				object.applyMatrix4(matrix);
			}
		}
	}

	private _t = new Vector3(0, 0, 0);
	private _s = new Vector3(1, 1, 1);
	private _scale = 1;
	private _matrix(r: Vector3, rot_order_index: number) {
		return this._core_transform.matrix(this._t, r, this._s, this._scale, ROTATION_ORDERS[rot_order_index]);
	}
}
