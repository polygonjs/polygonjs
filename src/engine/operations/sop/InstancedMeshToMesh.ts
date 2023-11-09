import {InstancedMesh, Mesh, Object3D} from 'three';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {copyObjectAllProperties} from '../../../core/geometry/modules/three/ThreejsObjectUtils';
import {isArray} from '../../../core/Type';

interface InstancedMeshToMeshSopParams extends DefaultOperationParams {
	cloneGeometry: boolean;
}

export class InstancedMeshToMeshSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: InstancedMeshToMeshSopParams = {
		cloneGeometry: true,
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.ALWAYS, InputCloneMode.NEVER];
	static override type(): Readonly<SopType.INSTANCED_MESH_TO_MESH> {
		return SopType.INSTANCED_MESH_TO_MESH;
	}

	override async cook(coreGroups: CoreGroup[], params: InstancedMeshToMeshSopParams) {
		const coreGroup = coreGroups[0];

		const inputObjects = coreGroup.threejsObjects();
		const newObjects: Object3D[] = [];
		const childrenToRemove: Object3D[] = [];
		for (const inputObject of inputObjects) {
			inputObject.traverse((child) => {
				if (child instanceof InstancedMesh) {
					childrenToRemove.push(child);

					const count = child.count;
					const geometry = child.geometry;
					const material = child.material;
					for (let i = 0; i < count; i++) {
						const newMesh = copyObjectAllProperties(child, new Mesh());
						(newMesh as Mesh).geometry = params.cloneGeometry ? geometry.clone() : geometry;
						(newMesh as Mesh).material = isArray(material) ? material[0] : material;
						child.getMatrixAt(i, newMesh.matrix);
						newMesh.matrix.decompose(newMesh.position, newMesh.quaternion, newMesh.scale);

						const parent = child.parent;
						if (parent) {
							parent.add(newMesh);
						} else {
							newObjects.push(newMesh);
						}
					}
				} else {
					if (child === inputObject) {
						newObjects.push(child);
					}
				}
			});
		}

		for (const childToRemove of childrenToRemove) {
			childToRemove.parent?.remove(childToRemove);
		}

		return this.createCoreGroupFromObjects(newObjects);
	}
}
