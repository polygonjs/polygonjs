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

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class SphereSopParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(SPHERE_TYPE.default, {
		menu: {
			entries: SPHERE_TYPES.map((name) => {
				return {name: name, value: SPHERE_TYPE[name]};
			}),
		},
	});
	radius = ParamConfig.FLOAT(1, {visible_if: {type: SPHERE_TYPE.default}});
	resolution = ParamConfig.VECTOR2([8, 6], {visible_if: {type: SPHERE_TYPE.default}});
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

	cook() {
		let geometry;
		if (this.pv.type == SPHERE_TYPE.default) {
			geometry = this._create_default_sphere();
		} else {
			geometry = this._create_default_isocahedron();
		}
		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);
		this.set_geometry(geometry);
	}
	_create_default_sphere() {
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
