/**
 * Creates a plane.
 *
 * @remarks
 * This node is similar to the Color and Normal SOPs, and can update the vertex positions with expressions
 *
 */
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreObject} from '../../../core/geometry/Object';
import {CorePoint} from '../../../core/geometry/Point';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {Mesh} from 'three/src/objects/Mesh';
import {BooleanParam} from '../../params/Boolean';
import {FloatParam} from '../../params/Float';

const POSITION_ATTRIB_NAME = 'position';

type ValueArrayByName = Map<string, number[]>;
type ComponentOffset = 0 | 1 | 2;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
class PointSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to update the x component */
	updateX = ParamConfig.BOOLEAN(0);
	/** @param expression the x component */
	x = ParamConfig.FLOAT('@P.x', {
		visibleIf: {updateX: 1},
		expression: {forEntities: true},
	});
	/** @param toggle on to update the y component */
	updateY = ParamConfig.BOOLEAN(0);
	/** @param expression the y component */
	y = ParamConfig.FLOAT('@P.y', {
		visibleIf: {updateY: 1},
		expression: {forEntities: true},
	});
	/** @param toggle on to update the z component */
	updateZ = ParamConfig.BOOLEAN(0);
	/** @param expression the z component */
	z = ParamConfig.FLOAT('@P.z', {
		visibleIf: {updateZ: 1},
		expression: {forEntities: true},
	});
	/** @param toggle on to update the normals */
	updateNormals = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new PointSopParamsConfig();

export class PointSopNode extends TypedSopNode<PointSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'point';
	}

	private _x_arrays_by_geometry_uuid: ValueArrayByName = new Map();
	private _y_arrays_by_geometry_uuid: ValueArrayByName = new Map();
	private _z_arrays_by_geometry_uuid: ValueArrayByName = new Map();

	static override displayedInputNames(): string[] {
		return ['points to move'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
		// this.uiData.set_icon('dot-circle');
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		await this._evalExpressionsForCoreGroup(coreGroup);
	}

	// group.traverse (object)=>
	// 	if (geometry = object.geometry)?
	// 		this._eval_expressions(geometry)
	// 		geometry.computeVertexNormals()

	async _evalExpressionsForCoreGroup(coreGroup: CoreGroup) {
		const coreObjects = coreGroup.coreObjects();
		// this._allocate_arrays(core_objects)

		for (let i = 0; i < coreObjects.length; i++) {
			await this._evalExpressionsForCoreObject(coreObjects[i]);
		}

		if (isBooleanTrue(this.pv.updateNormals)) {
			coreGroup.computeVertexNormals();
		}

		const geometries = coreGroup.geometries();
		for (let geometry of geometries) {
			geometry.computeBoundingBox();
		}

		// needs update required for when no cloning
		if (!this.io.inputs.cloneRequired(0)) {
			const geometries = coreGroup.geometries();
			for (let geometry of geometries) {
				const attrib = geometry.getAttribute(POSITION_ATTRIB_NAME) as BufferAttribute;
				attrib.needsUpdate = true;
			}
		}

		this.setCoreGroup(coreGroup);
	}
	async _evalExpressionsForCoreObject(coreObject: CoreObject) {
		const object = coreObject.object();
		const geometry = (object as Mesh).geometry as BufferGeometry;
		const points = coreObject.points();

		const array = geometry.getAttribute(POSITION_ATTRIB_NAME).array as number[];

		const tmp_array_x = await this._updateFromParam(
			geometry,
			array,
			points,
			this.p.updateX,
			this.p.x,
			this.pv.x,
			this._x_arrays_by_geometry_uuid,
			0
		);
		const tmp_array_y = await this._updateFromParam(
			geometry,
			array,
			points,
			this.p.updateY,
			this.p.y,
			this.pv.y,
			this._y_arrays_by_geometry_uuid,
			1
		);
		const tmp_array_z = await this._updateFromParam(
			geometry,
			array,
			points,
			this.p.updateZ,
			this.p.z,
			this.pv.z,
			this._z_arrays_by_geometry_uuid,
			2
		);

		if (tmp_array_x) {
			this._commit_tmp_values(tmp_array_x, array, 0);
		}
		if (tmp_array_y) {
			this._commit_tmp_values(tmp_array_y, array, 1);
		}
		if (tmp_array_z) {
			this._commit_tmp_values(tmp_array_z, array, 2);
		}
	}

	private async _updateFromParam(
		geometry: BufferGeometry,
		array: number[],
		points: CorePoint[],
		do_update_param: BooleanParam,
		value_param: FloatParam,
		param_value: number,
		arrays_by_geometry_uuid: ValueArrayByName,
		offset: ComponentOffset
	) {
		const do_update = do_update_param;
		const param = value_param;

		let tmpArray = this._initArrayIfRequired(geometry, arrays_by_geometry_uuid, points.length, offset);
		if (do_update.value) {
			if (param.hasExpression() && param.expressionController) {
				await param.expressionController.computeExpressionForPoints(points, (point, value) => {
					tmpArray[point.index()] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					tmpArray[point.index()] = param_value;
				}
			}
		}
		return tmpArray;
	}

	private _initArrayIfRequired(
		geometry: BufferGeometry,
		arrays_by_geometry_uuid: ValueArrayByName,
		points_count: number,
		offset: ComponentOffset
	) {
		const uuid = geometry.uuid;
		const current_array = arrays_by_geometry_uuid.get(uuid);
		if (current_array) {
			// only create new array if we need more point, or as soon as the length is different?
			if (current_array.length < points_count) {
				const new_array = this._array_for_component(geometry, points_count, offset);
				arrays_by_geometry_uuid.set(uuid, new_array);
				return new_array;
			} else {
				return current_array;
			}
		} else {
			const new_array = this._array_for_component(geometry, points_count, offset);
			arrays_by_geometry_uuid.set(uuid, new_array);
			return new_array;
		}
	}

	private _array_for_component(geometry: BufferGeometry, points_count: number, offset: ComponentOffset) {
		const new_array = new Array<number>(points_count);
		const src_array = geometry.getAttribute(POSITION_ATTRIB_NAME).array;
		for (let i = 0; i < new_array.length; i++) {
			new_array[i] = src_array[i * 3 + offset];
		}
		return new_array;
	}

	private _commit_tmp_values(tmp_array: number[], target_array: number[], offset: number) {
		for (let i = 0; i < tmp_array.length; i++) {
			target_array[i * 3 + offset] = tmp_array[i];
		}
	}
}
