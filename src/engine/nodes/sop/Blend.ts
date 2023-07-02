/**
 * blends 2 geometries together.
 *
 * @remarks
 * Note that both geometries must have the same number of points for predictable results
 *
 */
import {TypedSopNode} from './_Base';
import {BufferAttribute, Object3D} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry} from 'three';
import {Mesh} from 'three';
import {isBooleanTrue} from '../../../core/Type';
import {SopType} from '../../poly/registers/nodes/types/Sop';

class BlendSopParamsConfig extends NodeParamsConfig {
	/** @param name of the attribute to blend */
	attribName = ParamConfig.STRING('position');
	/** @param blend value. 0 means the result will equal the left input, 1 will equal the right input, and 0.5 will be an average of both. */
	blend = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param update normals */
	updateNormals = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new BlendSopParamsConfig();

export class BlendSopNode extends TypedSopNode<BlendSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.BLEND;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];

		const objects0 = coreGroup0.threejsObjects();
		const objects1 = coreGroup1.threejsObjects();

		for (let i = 0; i < objects0.length; i++) {
			this.blend(objects0[i], objects1[i], this.pv.blend);
		}
		this.setCoreGroup(coreGroup0);
	}

	private blend(object0: Object3D, object1: Object3D, blend: number) {
		const geometry0 = (object0 as Mesh).geometry as BufferGeometry;
		const geometry1 = (object1 as Mesh).geometry as BufferGeometry;
		if (geometry0 == null || geometry1 == null) {
			return;
		}

		const attrib0 = geometry0.getAttribute(this.pv.attribName) as BufferAttribute | undefined;
		const attrib1 = geometry1.getAttribute(this.pv.attribName) as BufferAttribute | undefined;
		if (attrib0 == null || attrib1 == null) {
			return;
		}

		const attrib0_array = attrib0.array as number[];
		const attrib1_array = attrib1.array as number[];

		let c0, c1;
		for (let i = 0; i < attrib0_array.length; i++) {
			c0 = attrib0_array[i];
			c1 = attrib1_array[i];
			if (c1 != null) {
				attrib0_array[i] = (1 - blend) * c0 + blend * c1;
			}
		}

		if (isBooleanTrue(this.pv.updateNormals)) {
			geometry0.computeVertexNormals();
		}
	}
}
