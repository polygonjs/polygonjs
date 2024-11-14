import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {Mesh} from 'three';
import {ThreejsPrimitiveTriangle, triangleArea} from '../../../core/geometry/modules/three/ThreejsPrimitiveTriangle';
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {
	primitivesFromObject,
	primitivesFromObjectFromGroup,
} from '../../../core/geometry/entities/primitive/CorePrimitiveUtils';

const _primitives: ThreejsPrimitiveTriangle[] = [];

interface MeasureSopParams extends DefaultOperationParams {
	group: string;
	attribName: string;
}
export class MeasureSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: MeasureSopParams = {
		group: '',
		attribName: 'area',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.MEASURE> {
		return SopType.MEASURE;
	}

	override cook(inputCoreGroups: CoreGroup[], params: MeasureSopParams) {
		const coreGroup = inputCoreGroups[0];

		const selectedObjects = CoreMask.filterObjects(coreGroup, params);
		for (const inputObject of selectedObjects) {
			const mesh = inputObject as Mesh;
			if (mesh.geometry != null && mesh.geometry.index != null) {
				this._measure(mesh, params);
			}
		}
		coreGroup.resetBoundingBox();
		return coreGroup;
	}
	private _measure(object: Mesh, params: MeasureSopParams) {
		const primitiveClass = ThreejsPrimitiveTriangle;
		const trianglesCount = primitiveClass.entitiesCount(object);
		const values = new Array(trianglesCount).fill(-1);
		for (let i = 0; i < trianglesCount; i++) {
			const triangle = new primitiveClass(object, i);
			const area = triangleArea(triangle);
			values[i] = area;
		}
		const attribName = CoreAttribute.remapName(params.attribName);

		let attribute = primitiveClass.attribute(object, attribName);
		if (!attribute) {
			attribute = {array: values, itemSize: 1, isString: false};
			primitiveClass.addAttribute(object, attribName, attribute);
		}

		if (params.group) {
			primitivesFromObjectFromGroup(object, params.group, _primitives);
		} else {
			primitivesFromObject(object, _primitives);
		}
		for (const primitive of _primitives) {
			const value = values[primitive.index()];
			primitive.setAttribValue(attribName, value);
		}
	}
}
