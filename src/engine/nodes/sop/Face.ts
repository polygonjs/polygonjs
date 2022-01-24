/**
 * Processes the faces of the input geometry
 *
 *
 */
import {Vector3} from 'three/src/math/Vector3';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {Mesh} from 'three/src/objects/Mesh';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreFace} from '../../../core/geometry/Face';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {isBooleanTrue} from '../../../core/BooleanValue';
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
				this._transform_faces(core_group);
			}
		}

		this.setCoreGroup(core_group);
	}

	private _makeFacesUnique(core_group: CoreGroup) {
		for (let object of core_group.objects()) {
			if ((object as Mesh).isMesh) {
				const geometry = (object as Mesh).geometry as BufferGeometry;
				const faces = ArrayUtils.chunk((geometry.index?.array as number[]) || [], 3);
				const points_count = faces.length * 3;
				for (let attrib_name of Object.keys(geometry.attributes)) {
					const attrib = geometry.attributes[attrib_name];
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

	private _addFaceCenterAttribute(core_group: CoreGroup) {
		const attrib_name = 'face_center';
		const face_center = new Vector3();
		let faces: CoreFace[], face: CoreFace, points: CorePoint[], point: CorePoint;

		core_group.coreObjects().forEach((core_object) => {
			const object = core_object.object();
			const core_geometry = core_object.coreGeometry();
			if ((object as Mesh).isMesh && core_geometry) {
				faces = core_geometry.faces();
				if (!core_geometry.hasAttrib(attrib_name)) {
					core_geometry.addNumericAttrib(attrib_name, 3, -1);
				}

				for (let fi = 0; fi < faces.length; fi++) {
					face = faces[fi];
					face.center(face_center);

					points = face.points();
					for (let pi = 0; pi < points.length; pi++) {
						point = points[pi];
						point.setAttribValue(attrib_name, face_center);
					}
				}
			}
		});
	}

	private _addFaceId(core_group: CoreGroup) {
		const attrib_name = 'face_id';

		core_group.coreObjects().forEach((core_object) => {
			const object = core_object.object();
			const core_geometry = core_object.coreGeometry();
			if ((object as Mesh).isMesh && core_geometry) {
				const faces = core_geometry.faces();
				// const points_count = core_geometry.pointsCount();

				if (!core_geometry.hasAttrib(attrib_name)) {
					core_geometry.addNumericAttrib(attrib_name, 1, -1);
				}

				for (let i = 0; i < faces.length; i++) {
					const face = faces[i];
					const points = face.points();
					for (let j = 0; j < points.length; j++) {
						const point = points[j];
						point.setAttribValue(attrib_name, i);
					}
				}
			}
		});
	}

	private _transform_faces(core_group: CoreGroup) {
		const attrib_name = 'position';
		const face_center = new Vector3();
		const new_position = new Vector3();
		const scale = this.pv.scale;
		let faces: CoreFace[], face: CoreFace, points: CorePoint[], point: CorePoint;

		core_group.coreObjects().forEach((core_object) => {
			const object = core_object.object();
			const core_geometry = core_object.coreGeometry();
			if ((object as Mesh).isMesh && core_geometry) {
				faces = core_geometry.faces();
				if (!core_geometry.hasAttrib(attrib_name)) {
					core_geometry.addNumericAttrib(attrib_name, 3, -1);
				}

				for (let fi = 0; fi < faces.length; fi++) {
					face = faces[fi];
					face.center(face_center);

					points = face.points();
					for (let pi = 0; pi < points.length; pi++) {
						point = points[pi];
						const position = point.position();
						new_position.x = position.x * scale + face_center.x * (1 - scale);
						new_position.y = position.y * scale + face_center.y * (1 - scale);
						new_position.z = position.z * scale + face_center.z * (1 - scale);
						point.setAttribValue(attrib_name, new_position);
					}
				}
			}
		});
	}
}
