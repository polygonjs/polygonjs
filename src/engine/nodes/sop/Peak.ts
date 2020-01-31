import {CoreGeometry} from 'src/core/geometry/Geometry';
import {TypedSopNode} from './_Base';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
import {CoreGroup} from 'src/core/geometry/Group';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';

const POSITION = 'position';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class PeakSopParamsConfig extends NodeParamsConfig {
	amount = ParamConfig.FLOAT(1, {range: [-1, 1]});
}
const ParamsConfig = new PeakSopParamsConfig();

export class PeakSopNode extends TypedSopNode<PeakSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'peak';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		let core_geometry, point;
		for (let object of core_group.objects()) {
			object.traverse((child_object) => {
				let geometry;
				if ((geometry = (child_object as Mesh).geometry as BufferGeometry) != null) {
					core_geometry = new CoreGeometry(geometry);
					for (point of core_geometry.points()) {
						const normal = point.normal();
						const position = point.position();
						const new_position = position.clone().add(normal.multiplyScalar(this.pv.amount));
						point.set_position(new_position);
					}

					if (!this.io.inputs.input_cloned(0)) {
						const attrib = core_geometry.geometry().getAttribute(POSITION) as BufferAttribute;
						attrib.needsUpdate = true;
					}
				}
			});
		}
		this.set_core_group(core_group);
	}
}
