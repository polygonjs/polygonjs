/**
 * Updates the normals of the geometry
 *
 * @remarks
 * Just like the Point and Color SOPs, this can take expressions
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreObject} from '../../../core/geometry/modules/three/CoreObject';
import {Attribute} from '../../../core/geometry/Attribute';
import {BufferGeometry, BufferAttribute, Mesh} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
class NormalsSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on if normals can be updated via expressions */
	edit = ParamConfig.BOOLEAN(0);
	/** @param toggle on to update the x component */
	updateX = ParamConfig.BOOLEAN(0, {
		visibleIf: {edit: 1},
	});
	/** @param expression or value for the x component */
	x = ParamConfig.FLOAT('@N.x', {
		visibleIf: {updateX: 1, edit: 1},
		expression: {forEntities: true},
	});
	/** @param toggle on to update the y component */
	updateY = ParamConfig.BOOLEAN(0, {
		visibleIf: {edit: 1},
	});
	/** @param expression or value for the y component */
	y = ParamConfig.FLOAT('@N.y', {
		visibleIf: {updateY: 1, edit: 1},
		expression: {forEntities: true},
	});
	/** @param toggle on to update the z component */
	updateZ = ParamConfig.BOOLEAN(0, {
		visibleIf: {edit: 1},
	});
	/** @param expression or value for the z component */
	z = ParamConfig.FLOAT('@N.z', {
		visibleIf: {updateZ: 1, edit: 1},
		expression: {forEntities: true},
	});

	/** @param recompute the normals based on the position */
	recompute = ParamConfig.BOOLEAN(1, {
		visibleIf: {edit: 0},
	});
	/** @param invert normals */
	invert = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new NormalsSopParamsConfig();

export class NormalsSopNode extends TypedSopNode<NormalsSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.NORMALS;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		if (isBooleanTrue(this.pv.edit)) {
			await this._eval_expressions_for_core_group(coreGroup);
		} else {
			if (this.pv.recompute) {
				const objects = coreGroup.threejsObjectsWithGeo();
				for (let object of objects) {
					object.geometry.computeVertexNormals();
				}
			}
		}
		if (isBooleanTrue(this.pv.invert)) {
			this._invert_normals(coreGroup);
		}

		this.setCoreGroup(coreGroup);
	}

	private async _eval_expressions_for_core_group(coreGroup: CoreGroup) {
		const core_objects = coreGroup.threejsCoreObjects();
		for (let i = 0; i < core_objects.length; i++) {
			await this._eval_expressions_for_core_object(core_objects[i]);
		}
	}
	private async _eval_expressions_for_core_object(coreObject: CoreObject) {
		const object = coreObject.object();
		const geometry = (object as Mesh).geometry as BufferGeometry;
		const points = pointsFromObject(object);
		const corePointClass = corePointClassFactory(object);

		let attrib = geometry.getAttribute(Attribute.NORMAL) as BufferAttribute;
		if (!attrib) {
			corePointClass.addNumericAttribute(object, Attribute.NORMAL, 3, 0);
			attrib = geometry.getAttribute(Attribute.NORMAL) as BufferAttribute;
		}
		const array = attrib.array as number[];

		// x
		if (isBooleanTrue(this.pv.updateX)) {
			const param = this.p.x;
			if (param.hasExpression() && param.expressionController && param.expressionController.entitiesDependent()) {
				await param.expressionController.computeExpressionForPoints(points, (point, value) => {
					array[point.index() * 3 + 0] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index() * 3 + 0] = param.value;
				}
			}
		}
		// y
		if (isBooleanTrue(this.pv.updateY)) {
			const param = this.p.y;
			if (param.hasExpression() && param.expressionController && param.expressionController.entitiesDependent()) {
				await param.expressionController.computeExpressionForPoints(points, (point, value) => {
					array[point.index() * 3 + 1] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index() * 3 + 1] = param.value;
				}
			}
		}
		// z
		if (isBooleanTrue(this.pv.updateZ)) {
			const param = this.p.z;
			if (param.hasExpression() && param.expressionController && param.expressionController.entitiesDependent()) {
				await param.expressionController.computeExpressionForPoints(points, (point, value) => {
					array[point.index() * 3 + 2] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index() * 3 + 2] = param.value;
				}
			}
		}
	}

	private _invert_normals(core_group: CoreGroup) {
		for (let core_object of core_group.threejsCoreObjects()) {
			const geometry = core_object.coreGeometry()?.geometry();
			if (geometry) {
				const normal_attrib = geometry.attributes[Attribute.NORMAL] as BufferAttribute;
				if (normal_attrib) {
					const array = normal_attrib.array as number[];
					for (let i = 0; i < array.length; i++) {
						array[i] *= -1;
					}
				}
			}
		}
	}
}
