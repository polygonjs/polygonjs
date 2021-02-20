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
import {CoreObject} from '../../../core/geometry/Object';
import {Attribute} from '../../../core/geometry/Attribute';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometry} from '../../../core/geometry/Geometry';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
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
	params_config = ParamsConfig;
	static type() {
		return 'normals';
	}

	static displayedInputNames(): string[] {
		return ['geometry to update normals of'];
	}
	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		if (isBooleanTrue(this.pv.edit)) {
			await this._eval_expressions_for_core_group(core_group);
		} else {
			if (this.pv.recompute) {
				core_group.computeVertexNormals();
			}
		}
		if (isBooleanTrue(this.pv.invert)) {
			this._invert_normals(core_group);
		}

		this.setCoreGroup(core_group);
	}

	private async _eval_expressions_for_core_group(core_group: CoreGroup) {
		const core_objects = core_group.coreObjects();
		for (let i = 0; i < core_objects.length; i++) {
			await this._eval_expressions_for_core_object(core_objects[i]);
		}
	}
	private async _eval_expressions_for_core_object(core_object: CoreObject) {
		const object = core_object.object();
		const geometry = (object as Mesh).geometry as BufferGeometry;
		const points = core_object.points();

		let attrib = geometry.getAttribute(Attribute.NORMAL);
		if (!attrib) {
			const core_geometry = new CoreGeometry(geometry);
			core_geometry.addNumericAttrib(Attribute.NORMAL, 3, 0);
			attrib = geometry.getAttribute(Attribute.NORMAL);
		}
		const array = attrib.array as number[];

		// x
		if (isBooleanTrue(this.pv.updateX)) {
			if (this.p.x.hasExpression() && this.p.x.expressionController) {
				await this.p.x.expressionController.compute_expression_for_points(points, (point, value) => {
					array[point.index() * 3 + 0] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index() * 3 + 0] = this.pv.x;
				}
			}
		}
		// y
		if (isBooleanTrue(this.pv.updateY)) {
			if (this.p.y.hasExpression() && this.p.y.expressionController) {
				await this.p.y.expressionController.compute_expression_for_points(points, (point, value) => {
					array[point.index() * 3 + 1] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index() * 3 + 1] = this.pv.y;
				}
			}
		}
		// z
		if (isBooleanTrue(this.pv.updateZ)) {
			if (this.p.z.hasExpression() && this.p.z.expressionController) {
				await this.p.z.expressionController.compute_expression_for_points(points, (point, value) => {
					array[point.index() * 3 + 2] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index() * 3 + 2] = this.pv.z;
				}
			}
		}
	}

	private _invert_normals(core_group: CoreGroup) {
		for (let core_object of core_group.coreObjects()) {
			const geometry = core_object.coreGeometry()?.geometry();
			if (geometry) {
				const normal_attrib = geometry.attributes[Attribute.NORMAL];
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
