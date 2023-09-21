import {
	Bone,
	SkinnedMesh,
	Material,
	AnimationClip,
	BufferGeometry,
	Color,
	Mesh,
	Box3,
	Sphere,
	Vector3,
	Object3D,
	Matrix4,
} from 'three';
import {cloneBufferGeometry} from '../../Geometry';
import {Object3DWithGeometry} from '../../Group';
import {dataFromConstructor, ObjectData, ObjectType} from '../../Constant';
import {objectData} from '../../entities/object/BaseCoreObjectUtils';
import {MaterialWithCustomMaterials, applyCustomMaterials} from '../../Material';
import {ObjectUtils} from '../../../ObjectUtils';
import {ThreeMeshBVHHelper} from '../../bvh/ThreeMeshBVHHelper';
import {CoreGeometryBuilderMerge} from './builders/Merge';
import {CoreObjectType, MergeCompactOptions, objectContentCopyProperties} from '../../ObjectContent';
import {BaseCoreObject} from '../../entities/object/BaseCoreObject';
import {TransformTargetType} from '../../../Transform';
import {TypeAssert} from '../../../../engine/poly/Assert';
import {applyTransformWithSpaceToObject, ObjectTransformMode, ObjectTransformSpace} from '../../../TransformSpace';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {CorePrimitive} from '../../entities/primitive/CorePrimitive';
import {primitiveClassFactoryNonAbstract} from './ThreeModule';
import {ThreejsVertex} from './ThreejsVertex';
import {ThreejsPoint} from './ThreejsPoint';

interface Object3DWithAnimations extends Object3D {
	animations: AnimationClip[];
}
interface MaterialWithColor extends Material {
	color: Color;
}
const COMPUTE_PRECISE_BOUNDS = true;
const SPHERE_EMPTY = new Sphere(new Vector3(0, 0, 0), 0);

export class ThreejsCoreObject extends BaseCoreObject<CoreObjectType.THREEJS> {
	protected override _object: Object3D;
	constructor(_object: Object3D, index: number) {
		super(_object, index);
		this._object = _object;
	}
	override humanType(): string {
		return dataFromConstructor(this._object.constructor).humanName;
	}
	override object() {
		return this._object;
	}
	override geometry(): BufferGeometry | null {
		return (this._object as Mesh).geometry as BufferGeometry | null;
	}
	// object():Object3D{
	// 	return this._object
	// }
	// coreGeometry(): CoreGeometry | null {
	// 	const geo = this.geometry();
	// 	if (geo) {
	// 		return new CoreGeometry(geo);
	// 	} else {
	// 		return null;
	// 	}
	// 	// const geo = this.geometry()
	// 	// if (geo) {
	// 	// 	return new CoreGeometry(geo)
	// 	// } else {
	// 	// 	return null
	// 	// }
	// }

	static override objectData(object: Object3D): ObjectData {
		const data = objectData(object);
		data.verticesCount = ThreejsVertex.verticesCount(object);
		data.pointsCount = ThreejsPoint.pointsCount(object);
		const primitiveClass = primitiveClassFactoryNonAbstract(object);
		data.primitivesCount = primitiveClass?.primitivesCount(object) || 0;
		data.primitiveName = primitiveClass?.primitiveName() || '';
		return data;
	}

	static override position(object: Object3D, target: Vector3) {
		target.copy(object.position);
	}
	static override boundingBox(object: Object3D, target: Box3) {
		target.setFromObject(object, COMPUTE_PRECISE_BOUNDS);
	}
	static override geometryBoundingBox(object: Object3D, target: Box3) {
		const geometry = (object as Mesh).geometry;
		if (geometry) {
			if (!geometry.boundingBox) {
				geometry.computeBoundingBox();
			}
			if (geometry.boundingBox) {
				target.copy(geometry.boundingBox);
			}
		} else {
			target.makeEmpty();
		}
	}
	static override boundingSphere(object: Object3D, target: Sphere) {
		const geometry = (object as Mesh).geometry;
		if (!geometry) {
			target.copy(SPHERE_EMPTY);
			return;
		}
		geometry.computeBoundingSphere();
		const computedSphere = geometry.boundingSphere;
		if (!computedSphere) {
			target.copy(SPHERE_EMPTY);
			return;
		}
		target.copy(computedSphere);
	}
	static override geometryBoundingSphere(object: Object3D, target: Sphere): void {
		this.boundingSphere(object, target);
	}

	// computeVertexNormals() {
	// 	this.coreGeometry()?.computeVertexNormals();
	// }
	static override clone(srcObject: Object3D) {
		const clonedObject = srcObject.clone();
		var sourceLookup = new Map<Object3D, Object3D>();
		var cloneLookup = new Map<Object3D, Object3D>();
		ThreejsCoreObject.parallelTraverse(
			srcObject,
			clonedObject,
			function (sourceNode: Object3D, clonedNode: Object3D) {
				sourceLookup.set(clonedNode, sourceNode);
				cloneLookup.set(sourceNode, clonedNode);
			}
		);
		clonedObject.traverse(function (node) {
			const srcNode = sourceLookup.get(node) as SkinnedMesh | undefined;
			const meshNode = node as Mesh;

			if (meshNode.geometry && srcNode && srcNode.geometry) {
				const srcNodeGeometry = srcNode.geometry as BufferGeometry;
				meshNode.geometry = cloneBufferGeometry(srcNodeGeometry);
				ThreeMeshBVHHelper.copyBVH(meshNode, srcNode);
				// const mesh_node_geometry = meshNode.geometry as BufferGeometry;
				// if (mesh_node_geometry.userData) {
				// 	mesh_node_geometry.userData = ObjectUtils.cloneDeep(srcNodeGeometry.userData);
				// }
			}
			if (meshNode.material) {
				// no need to assign the material here
				// as this should already be done in the .clone() method.
				// Otherwise, when this is assigned here, some objects that rely on their own mat
				// such as sop/Reflector stop working when cloned
				// mesh_node.material = src_node.material;
				applyCustomMaterials(node, meshNode.material as MaterialWithCustomMaterials);

				// prevents crashes for linesegments with shader material such as the line dashed instance
				// TODO: test
				const material_with_color = meshNode.material as MaterialWithColor;
				if (material_with_color.color == null) {
					material_with_color.color = new Color(1, 1, 1);
				}
			}
			if (srcNode) {
				if (srcNode.userData) {
					node.userData = ObjectUtils.cloneDeep(srcNode.userData);
				}
				const src_node_with_animations = (<unknown>srcNode) as Object3DWithAnimations;
				if (src_node_with_animations.animations) {
					(node as Object3DWithAnimations).animations = src_node_with_animations.animations.map((animation) =>
						animation.clone()
					);
				}
				const skinned_node = node as SkinnedMesh;
				if (skinned_node.isSkinnedMesh) {
					var clonedMesh = skinned_node;
					var sourceMesh = srcNode;
					var sourceBones = sourceMesh.skeleton.bones;

					clonedMesh.skeleton = sourceMesh.skeleton.clone();
					clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

					const new_bones = sourceBones.map(function (bone) {
						return cloneLookup.get(bone);
					}) as Bone[];

					clonedMesh.skeleton.bones = new_bones;

					clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
				}
			}
		});

		return clonedObject;
	}
	static parallelTraverse(a: Object3D, b: Object3D, callback: (a: Object3D, b: Object3D) => void) {
		callback(a, b);
		for (var i = 0; i < a.children.length; i++) {
			const childA = a.children[i];
			const childB = b.children[i];
			if (childA && childB) {
				this.parallelTraverse(childA, childB, callback);
			}
		}
	}
	static override applyMatrix(
		object: Object3D,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace,
		transformMode: ObjectTransformMode
	) {
		switch (transformTargetType) {
			case TransformTargetType.OBJECT: {
				applyTransformWithSpaceToObject(object, matrix, transformSpace, transformMode);
				// this._applyMatrixToObject(object, matrix);
				return;
			}
			case TransformTargetType.GEOMETRY: {
				const geometry = (object as Object3DWithGeometry).geometry;
				if (geometry) {
					geometry.applyMatrix4(matrix);
				}
				return;
			}
		}
		TypeAssert.unreachable(transformTargetType);
	}
	static override mergeCompact(options: MergeCompactOptions) {
		const {objects, material, objectType, mergedObjects, onError} = options;
		const firstObject = objects[0];
		if (!firstObject) {
			return;
		}
		const geometries: BufferGeometry[] = [];
		for (let object of objects) {
			const geometry = (object as Mesh).geometry;
			if (geometry) {
				geometry.applyMatrix4((object as Mesh).matrix);
				geometries.push(geometry);
			}
		}

		try {
			const mergedGeometry = CoreGeometryBuilderMerge.merge(geometries);
			if (mergedGeometry) {
				const newObject = BaseSopOperation.createObject(mergedGeometry, objectType as ObjectType, material);
				objectContentCopyProperties(firstObject, newObject);
				mergedObjects.push(newObject as Object3DWithGeometry);
			} else {
				onError('merge failed, check that input geometries have the same attributes');
			}
		} catch (e) {
			onError((e as Error).message || 'unknown error');
		}
	}
	//
	//
	// RELATED ENTITIES
	//
	//
	override relatedPrimitives(): CorePrimitive<CoreObjectType>[] {
		const _primitiveClassFactory = primitiveClassFactoryNonAbstract(this._object);
		if (!_primitiveClassFactory) {
			return [];
		}
		const primitivesCount = _primitiveClassFactory?.primitivesCount(this._object);
		const primitives: CorePrimitive<CoreObjectType>[] = [];
		for (let i = 0; i < primitivesCount; i++) {
			const primitive = new _primitiveClassFactory(this._object as any, i) as CorePrimitive<CoreObjectType>;
			primitives.push(primitive);
		}
		return primitives;
	}
}
