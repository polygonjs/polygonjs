/**
 * Split the faces when the angle between their respective normals goes above a threshold
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {toCreasedNormals} from '../../../modules/three/examples/jsm/utils/BufferGeometryUtils';
import {MathUtils} from 'three';
const {degToRad} = MathUtils;

class FacetSopParamsConfig extends NodeParamsConfig {
	/** @param angle threshold to separate vertices */
	angle = ParamConfig.FLOAT(20, {
		range: [0, 90],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new FacetSopParamsConfig();

export class FacetSopNode extends TypedSopNode<FacetSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'facet';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to update normals of'];
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const objects = inputCoreGroup.threejsObjectsWithGeo();
		const rad = degToRad(this.pv.angle);
		for (let object of objects) {
			object.geometry = toCreasedNormals(object.geometry, rad);
			// this._applyCusp(object.geometry);
		}
		this.setObjects(objects);
	}
}
