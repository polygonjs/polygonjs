import {TypedSopNode} from './_Base';
import {Vector3} from 'three/src/math/Vector3';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BufferAttribute, BufferGeometry} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class CenterSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CenterSopParamsConfig();

export class CenterSopNode extends TypedSopNode<CenterSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'center';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	private _geo_center: Vector3 = new Vector3();
	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const src_object = core_group.objects_with_geo()[0];

		const new_object = this._create_object(src_object);
		if (new_object) {
			this.set_object(new_object);
		} else {
			this.set_objects([]);
		}
	}

	private _create_object(src_object: Object3DWithGeometry) {
		const src_geometry = src_object.geometry;
		src_geometry.computeBoundingBox();
		if (src_geometry.boundingBox) {
			src_geometry.boundingBox?.getCenter(this._geo_center);
			src_object.updateMatrixWorld();
			this._geo_center.applyMatrix4(src_object.matrixWorld);
			const geometry = new BufferGeometry();
			const positions: number[] = this._geo_center.toArray();
			geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
			return this.create_object(geometry, ObjectType.POINTS);
		}
	}
}
