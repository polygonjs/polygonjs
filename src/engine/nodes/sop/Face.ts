/**
 * Processes the faces of the input geometry
 *
 *
 */
import {Mesh, BufferAttribute, BufferGeometry, Vector3} from 'three';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreFace} from '../../../core/geometry/modules/three/CoreFace';
import {CorePointArray3} from '../../../core/geometry/modules/three/Common';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {CoreThreejsPoint} from '../../../core/geometry/modules/three/CoreThreejsPoint';

const dummyMesh = new Mesh();
enum FaceAttribName {
	CENTER = 'faceCenter',
	ID = 'faceId',
	POSITION = 'position',
}
const _faceCenter = new Vector3();
const _position = new Vector3();
const _newPosition = new Vector3();

class FaceSopParamsConfig extends NodeParamsConfig {
	/** @param makes faces unique */
	makeFacesUnique = ParamConfig.BOOLEAN(0);
	/** @param adds a vector3 attribute that represents the center of a face */
	addFaceCenterAttribute = ParamConfig.BOOLEAN(0, {
		visibleIf: {makeFacesUnique: 1},
	});
	/** @param add an id attribute for each face */
	addFaceId = ParamConfig.BOOLEAN(0, {
		visibleIf: {makeFacesUnique: 1},
	});
	/** @param allows to transform each face */
	transform = ParamConfig.BOOLEAN(0, {
		visibleIf: {makeFacesUnique: 1},
	});
	/** @param scales the faces indepedently */
	scale = ParamConfig.FLOAT(1, {
		visibleIf: {makeFacesUnique: 1, transform: 1},
	});
}
const ParamsConfig = new FaceSopParamsConfig();

export class FaceSopNode extends TypedSopNode<FaceSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'face';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	private _face = new CoreFace();
	private _points: CorePointArray3 = [
		new CoreThreejsPoint(dummyMesh, 0),
		new CoreThreejsPoint(dummyMesh, 0),
		new CoreThreejsPoint(dummyMesh, 0),
	];
	override cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		if (isBooleanTrue(this.pv.makeFacesUnique)) {
			this._makeFacesUnique(core_group);

			// we can only add face_center attrib
			// if the faces have been split
			// otherwise a point may belong to multiple faces
			if (isBooleanTrue(this.pv.addFaceCenterAttribute)) {
				this._addFaceCenterAttribute(core_group);
			}
			if (isBooleanTrue(this.pv.addFaceId)) {
				this._addFaceId(core_group);
			}
			if (isBooleanTrue(this.pv.transform)) {
				this._transformFaces(core_group);
			}
		}

		this.setCoreGroup(core_group);
	}

	private _makeFacesUnique(core_group: CoreGroup) {
		const objects = core_group.threejsObjects();
		for (let object of objects) {
			if ((object as Mesh).isMesh) {
				const geometry = (object as Mesh).geometry as BufferGeometry;
				const faces = ArrayUtils.chunk((geometry.index?.array as number[]) || [], 3);
				const points_count = faces.length * 3;
				for (let attrib_name of Object.keys(geometry.attributes)) {
					const attrib = geometry.attributes[attrib_name] as BufferAttribute;
					const attrib_size = attrib.itemSize;
					const new_values = new Float32Array(points_count * attrib_size);
					let new_value_index = 0;
					faces.forEach((face) => {
						face.forEach((index) => {
							for (let i = 0; i < attrib_size; i++) {
								const current_value = attrib.array[index * attrib_size + i];
								new_values[new_value_index] = current_value;
								new_value_index += 1;
							}
						});
					});
					geometry.setAttribute(attrib_name, new BufferAttribute(new_values, attrib_size));
				}
				const new_indices = ArrayUtils.range(points_count);
				geometry.setIndex(new_indices);
			}
		}
	}

	private _addFaceCenterAttribute(coreGroup: CoreGroup) {
		// let faces: CoreFace[], face: CoreFace, points: CorePoint[], point: CorePoint;

		const coreObjects = coreGroup.threejsCoreObjects();
		for (const coreObject of coreObjects) {
			const object = coreObject.object();
			const corePointClass = corePointClassFactory(object);
			const coreGeometry = coreObject.coreGeometry();
			if ((object as Mesh).isMesh && coreGeometry) {
				if (!corePointClass.hasAttrib(object, FaceAttribName.CENTER)) {
					corePointClass.addNumericAttribute(object, FaceAttribName.CENTER, 3, -1);
				}

				const facesCount = coreGeometry.facesCount();
				this._face.setGeometry(coreGeometry.geometry());
				for (let fi = 0; fi < facesCount; fi++) {
					// face = faces[fi];
					this._face.setIndex(fi);
					this._face.center(_faceCenter);

					this._face.points(this._points);
					for (const point of this._points) {
						point.setAttribValue(FaceAttribName.CENTER, _faceCenter);
					}
				}
			}
		}
	}

	private _addFaceId(coreGroup: CoreGroup) {
		const coreObjects = coreGroup.threejsCoreObjects();

		for (const coreObject of coreObjects) {
			const object = coreObject.object();
			const corePointClass = corePointClassFactory(object);
			const coreGeometry = coreObject.coreGeometry();
			if ((object as Mesh).isMesh && coreGeometry) {
				// const faces = core_geometry.faces();
				// const points_count = core_geometry.pointsCount();

				if (!corePointClass.hasAttrib(object, FaceAttribName.ID)) {
					corePointClass.addNumericAttribute(object, FaceAttribName.ID, 1, -1);
				}

				const facesCount = coreGeometry.facesCount();
				this._face.setGeometry(coreGeometry.geometry());
				for (let i = 0; i < facesCount; i++) {
					this._face.setIndex(i);
					this._face.points(this._points);
					for (const point of this._points) {
						point.setAttribValue(FaceAttribName.ID, i);
					}
				}
			}
		}
	}

	private _transformFaces(coreGroup: CoreGroup) {
		const scale = this.pv.scale;

		const coreObjects = coreGroup.threejsCoreObjects();
		for (const coreObject of coreObjects) {
			const object = coreObject.object();
			const corePointClass = corePointClassFactory(object);
			const coreGeometry = coreObject.coreGeometry();
			if ((object as Mesh).isMesh && coreGeometry) {
				// faces = coreGeometry.faces();
				if (!corePointClass.hasAttrib(object, FaceAttribName.POSITION)) {
					corePointClass.addNumericAttribute(object, FaceAttribName.POSITION, 3, -1);
				}

				const facesCount = coreGeometry.facesCount();
				this._face.setGeometry(coreGeometry.geometry());
				for (let fi = 0; fi < facesCount; fi++) {
					this._face.setIndex(fi);
					this._face.center(_faceCenter);

					this._face.points(this._points);
					for (const point of this._points) {
						point.position(_position);
						_newPosition.x = _position.x * scale + _faceCenter.x * (1 - scale);
						_newPosition.y = _position.y * scale + _faceCenter.y * (1 - scale);
						_newPosition.z = _position.z * scale + _faceCenter.z * (1 - scale);
						point.setAttribValue(FaceAttribName.POSITION, _newPosition);
					}
				}
			}
		}
	}
}
