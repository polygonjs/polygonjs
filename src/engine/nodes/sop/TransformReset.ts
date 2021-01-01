/**
 * Resets the center of a geometry.
 *
 * @remarks
 * This can be useful when importing an object whose centroid is not at the center of the geometry. When using this geometry via the LOD SOP, the center of the object will be used to calculate the distance from the object to the camera. It is then necessary to ensure that the center of the object and the center of the geometry are as close to each other as possible.
 *
 * This node can operate in one of multiple modes:
 *
 * - reset_object: this will set the transform of objects to t=0,0,0, r=0,0,0 and s=0,0,0
 * - center geometry: TBD
 * - promote: TBD
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TypeAssert} from '../../poly/Assert';
import {Vector3} from 'three/src/math/Vector3';
import {Matrix4} from 'three/src/math/Matrix4';

enum TransformResetMode {
	RESET_OBJECT = 'reset objects transform',
	CENTER_GEO = 'center geometries',
	PROMOTE_GEO_TO_OBJECT = 'center geometry and transform object',
}
const TRANSFORM_RESET_MODES: TransformResetMode[] = [
	TransformResetMode.RESET_OBJECT,
	TransformResetMode.CENTER_GEO,
	TransformResetMode.PROMOTE_GEO_TO_OBJECT,
];

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {CoreTransform} from '../../../core/Transform';
class TransformResetSopParamConfig extends NodeParamsConfig {
	/** @param mode to reset the geometry and object */
	mode = ParamConfig.INTEGER(TRANSFORM_RESET_MODES.indexOf(TransformResetMode.RESET_OBJECT), {
		menu: {
			entries: TRANSFORM_RESET_MODES.map((target_type, i) => {
				return {name: target_type, value: i};
			}),
		},
	});
}
const ParamsConfig = new TransformResetSopParamConfig();

export class TransformResetSopNode extends TypedSopNode<TransformResetSopParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'transformReset';
	}

	static displayed_input_names(): string[] {
		return ['objects to reset transform', 'optional reference for center'];
	}
	private _bbox_center = new Vector3();
	private _translate_matrix = new Matrix4();

	initialize_node() {
		this.io.inputs.set_count(1, 2);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
	}

	setMode(mode: TransformResetMode) {
		this.p.mode.set(TRANSFORM_RESET_MODES.indexOf(mode));
	}

	cook(input_contents: CoreGroup[]) {
		const mode = TRANSFORM_RESET_MODES[this.pv.mode];
		this._select_mode(mode, input_contents);
	}
	private _select_mode(mode: TransformResetMode, core_groups: CoreGroup[]) {
		switch (mode) {
			case TransformResetMode.RESET_OBJECT: {
				return this._reset_objects(core_groups);
			}
			case TransformResetMode.CENTER_GEO: {
				return this._center_geos(core_groups, false);
			}
			case TransformResetMode.PROMOTE_GEO_TO_OBJECT: {
				return this._center_geos(core_groups, true);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _reset_objects(core_groups: CoreGroup[]) {
		const core_group = core_groups[0];
		const objects = core_group.objects();
		for (let object of objects) {
			object.matrix.identity();
			CoreTransform.decompose_matrix(object);
		}

		this.setCoreGroup(core_group);
	}
	private _center_geos(core_groups: CoreGroup[], apply_matrix_to_object: boolean) {
		const core_group = core_groups[0];
		const objects = core_group.objectsWithGeo();
		let ref_objects = objects;
		const ref_core_group = core_groups[1];
		if (ref_core_group) {
			ref_objects = ref_core_group.objectsWithGeo();
		}
		for (let i = 0; i < objects.length; i++) {
			const object = objects[i];
			const ref_object = ref_objects[i] || ref_objects[ref_objects.length - 1];
			const geometry = object.geometry;
			const ref_geometry = ref_object.geometry;
			if (geometry && ref_geometry) {
				// TODO: this current does not take into account the object transform,
				// and it's possible that it has been, especially if we used another transform_reset
				// just before
				ref_geometry.computeBoundingBox();
				const bbox = ref_geometry.boundingBox;
				if (bbox) {
					bbox.getCenter(this._bbox_center);
					ref_object.updateMatrixWorld();
					this._bbox_center.applyMatrix4(ref_object.matrixWorld);

					if (apply_matrix_to_object) {
						this._translate_matrix.identity();
						this._translate_matrix.makeTranslation(
							this._bbox_center.x,
							this._bbox_center.y,
							this._bbox_center.z
						);
						object.matrix.multiply(this._translate_matrix);
						CoreTransform.decompose_matrix(object);
						object.updateWorldMatrix(false, false);
						// object.updateMatrixWorld();
					}
					this._translate_matrix.identity();
					this._translate_matrix.makeTranslation(
						-this._bbox_center.x,
						-this._bbox_center.y,
						-this._bbox_center.z
					);
					geometry.applyMatrix4(this._translate_matrix);
				}
			}
		}

		this.setCoreGroup(core_group);
	}
}
