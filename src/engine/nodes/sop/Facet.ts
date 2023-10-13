/**
 * Split the faces when the angle between their respective normals goes above a threshold
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {toCreasedNormals} from 'three/examples/jsm/utils/BufferGeometryUtils';
import {MathUtils} from 'three';
import {CoreMask} from '../../../core/geometry/Mask';
import {object3DHasGeometry} from '../../../core/geometry/GeometryUtils';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CoreGeometryIndexBuilder} from '../../../core/geometry/util/IndexBuilder';
import {corePrimitiveClassFactory} from '../../../core/geometry/CoreObjectFactory';
const {degToRad} = MathUtils;

class FacetSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
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
		return SopType.FACET;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterThreejsObjects(inputCoreGroup, this.pv).filter(object3DHasGeometry);
		const rad = degToRad(this.pv.angle);
		for (const object of selectedObjects) {
			// we fetch the primitive attributes before the geometry is modified
			const primitiveAttributes = corePrimitiveClassFactory(object).attributes(object);
			object.geometry = toCreasedNormals(object.geometry, rad);

			CoreGeometryIndexBuilder.createIndexIfNone(object.geometry);

			// ensure primitive attributes are kept
			if (primitiveAttributes) {
				const primitiveAttributeNames = Object.keys(primitiveAttributes);
				for (const attribName of primitiveAttributeNames) {
					const attrib = primitiveAttributes[attribName];
					corePrimitiveClassFactory(object).addAttribute(object, attribName, attrib);
				}
			}
		}
		this.setCoreGroup(inputCoreGroup);
	}
}
