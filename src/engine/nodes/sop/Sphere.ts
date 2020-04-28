import {SphereBufferGeometry} from 'three/src/geometries/SphereGeometry';
import {IcosahedronBufferGeometry} from 'three/src/geometries/IcosahedronGeometry';
import {TypedSopNode} from './_Base';

enum SphereType {
	DEFAULT = 'default',
	ISOCAHEDRON = 'isocahedron',
}
type SphereTypes = {[key in SphereType]: number};
const SPHERE_TYPE: SphereTypes = {
	default: 0,
	isocahedron: 1,
};
const SPHERE_TYPES: Array<SphereType> = [SphereType.DEFAULT, SphereType.ISOCAHEDRON];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
class SphereSopParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(SPHERE_TYPE.default, {
		menu: {
			entries: SPHERE_TYPES.map((name) => {
				return {name: name, value: SPHERE_TYPE[name]};
			}),
		},
	});
	radius = ParamConfig.FLOAT(1, {visible_if: {type: SPHERE_TYPE.default}});
	resolution = ParamConfig.VECTOR2([30, 30], {visible_if: {type: SPHERE_TYPE.default}});
	open = ParamConfig.BOOLEAN(0, {visible_if: {type: SPHERE_TYPE.default}});
	angle_range_x = ParamConfig.VECTOR2([0, '$PI*2'], {visible_if: {type: SPHERE_TYPE.default, open: true}});
	angle_range_y = ParamConfig.VECTOR2([0, '$PI*2'], {visible_if: {type: SPHERE_TYPE.default, open: true}});
	detail = ParamConfig.INTEGER(1, {
		range: [0, 5],
		range_locked: [true, false],
		visible_if: {type: SPHERE_TYPE.isocahedron},
	});
	center = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new SphereSopParamsConfig();

export class SphereSopNode extends TypedSopNode<SphereSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'sphere';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		if (core_group) {
			this._cook_with_input(core_group);
		} else {
			this._cook_without_input();
		}
	}
	private _cook_without_input() {
		const geometry = this._create_required_geometry();
		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);
		this.set_geometry(geometry);
	}
	private _cook_with_input(core_group: CoreGroup) {
		const bbox = core_group.bounding_box();
		const size = bbox.max.clone().sub(bbox.min);
		const center = bbox.max.clone().add(bbox.min).multiplyScalar(0.5);

		const geometry = this._create_required_geometry();
		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);
		geometry.translate(center.x, center.y, center.z);
		geometry.scale(size.x, size.y, size.z);
		this.set_geometry(geometry);
	}

	private _create_required_geometry() {
		if (this.pv.type == SPHERE_TYPE.default) {
			return this._create_default_sphere();
		} else {
			return this._create_default_isocahedron();
		}
	}

	private _create_default_sphere() {
		if (this.pv.open) {
			return new SphereBufferGeometry(
				this.pv.radius,
				this.pv.resolution.x,
				this.pv.resolution.y,
				this.pv.angle_range_x.x,
				this.pv.angle_range_x.y,
				this.pv.angle_range_y.x,
				this.pv.angle_range_y.y
			);
		} else {
			return new SphereBufferGeometry(this.pv.radius, this.pv.resolution.x, this.pv.resolution.y);
		}
	}
	_create_default_isocahedron() {
		return new IcosahedronBufferGeometry(this.pv.radius, this.pv.detail);
	}
}
