/**
 * Allows easy position of lights, or any object around another one.
 *
 * @remarks
 * This node transforms its children with latitude and longitude controls, instead of typical translate and rotate. It makes it more intuitive to position objects such as lights.
 *
 * Note that there is an equivalent node at the SOP level
 *
 */
import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {FlagsControllerD} from '../utils/FlagsController';
import {AxesHelper} from 'three/src/helpers/AxesHelper';
import {HierarchyController} from './utils/HierarchyController';
import {Matrix4} from 'three/src/math/Matrix4';
import {Vector3} from 'three/src/math/Vector3';
import {degToRad} from 'three/src/math/MathUtils';
import {Quaternion} from 'three/src/math/Quaternion';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PolarGridHelper} from 'three/src/helpers/PolarGridHelper';
class PolarTransformObjParamConfig extends NodeParamsConfig {
	/** @param center of the transform */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param moves the objects along the longitude, which is equivalent to a rotation on the y axis */
	longitude = ParamConfig.FLOAT(0, {
		range: [0, 360],
	});
	/** @param moves the objects along the latitude, which is equivalent to a rotation on the z or x axis */
	latitude = ParamConfig.FLOAT(0, {
		range: [-180, 180],
	});
	/** @param moves the point aways from the center */
	depth = ParamConfig.FLOAT(1, {
		range: [0, 10],
	});
}
const ParamsConfig = new PolarTransformObjParamConfig();

const HOOK_NAME = '_cook_main_without_inputs_when_dirty';
const AXIS_VERTICAL = new Vector3(0, 1, 0);
const AXIS_HORIZONTAL = new Vector3(-1, 0, 0);

export class PolarTransformObjNode extends TypedObjNode<Group, PolarTransformObjParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'polarTransform';
	}
	override readonly hierarchyController: HierarchyController = new HierarchyController(this);
	public override readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper = this._createHelper();

	override createObject() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	override initializeNode() {
		this.hierarchyController.initializeNode();

		if (!this.dirtyController.hasHook(HOOK_NAME)) {
			this.dirtyController.addPostDirtyHook(HOOK_NAME, this._cook_main_without_inputs_when_dirty_bound);
		}

		this._updateHelperHierarchy();
		this._helper.matrixAutoUpdate = false;
		this.flags.display.onUpdate(() => {
			this._updateHelperHierarchy();
		});
	}
	private _updateHelperHierarchy() {
		if (this._displayedHelper()) {
			this.object.add(this._helper);
			this._updateHelper();
		} else {
			this.object.remove(this._helper);
		}
	}
	private _displayedHelper() {
		return this.flags.display.active();
	}

	private __axisHelper__: AxesHelper | undefined;
	private _axisHelper() {
		return (this.__axisHelper__ = this.__axisHelper__ || this._createAxisHelper());
	}
	private _createAxisHelper() {
		const axisHelper = new AxesHelper(1);
		axisHelper.matrixAutoUpdate = false;
		return axisHelper;
	}
	private __polarGridHelper__: PolarGridHelper | undefined;
	private _polarGridHelper() {
		return (this.__polarGridHelper__ = this.__polarGridHelper__ || this._createPolarGridHelper());
	}
	private _createPolarGridHelper() {
		const radius = this.pv.depth;
		const radials = 16;
		const circles = 8;
		const divisions = 64;
		const polarGridHelper = new PolarGridHelper(radius, radials, circles, divisions);
		polarGridHelper.matrixAutoUpdate = false;
		return polarGridHelper;
	}
	private _createHelper() {
		const group = new Group();
		group.name = 'PolarTransformHelper';
		group.matrixAutoUpdate = false;
		group.add(this._axisHelper());
		group.add(this._polarGridHelper());

		return group;
	}

	// TODO: this will have to be checked via the parent, when I will have obj managers at lower levels than root
	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.cookController.cookMainWithoutInputs();
	}

	private _centerMatrix = new Matrix4();
	private _longitudeMatrix = new Matrix4();
	private _latitudeMatrix = new Matrix4();
	private _depthMatrix = new Matrix4();
	private _fullMatrix = new Matrix4();
	private _decomposed = {
		t: new Vector3(),
		q: new Quaternion(),
		s: new Vector3(),
	};
	override cook() {
		const object = this.object;

		this._centerMatrix.identity();
		this._longitudeMatrix.identity();
		this._latitudeMatrix.identity();
		this._depthMatrix.identity();
		this._centerMatrix.makeTranslation(this.pv.center.x, this.pv.center.y, this.pv.center.z);
		this._longitudeMatrix.makeRotationAxis(AXIS_VERTICAL, degToRad(this.pv.longitude));
		this._latitudeMatrix.makeRotationAxis(AXIS_HORIZONTAL, degToRad(this.pv.latitude));
		this._depthMatrix.makeTranslation(0, 0, this.pv.depth);
		this._fullMatrix
			.copy(this._centerMatrix)
			.multiply(this._longitudeMatrix)
			.multiply(this._latitudeMatrix)
			.multiply(this._depthMatrix);

		this._fullMatrix.decompose(this._decomposed.t, this._decomposed.q, this._decomposed.s);
		object.position.copy(this._decomposed.t);
		object.quaternion.copy(this._decomposed.q);
		object.scale.copy(this._decomposed.s);
		object.updateMatrix();

		this._updateHelper();

		this.cookController.endCook();
	}

	private _updateHelper() {
		if (!this._displayedHelper()) {
			return;
		}
		this._helper.updateMatrix();
		this._polarGridHelper().matrix.copy(this.object.matrix);
		this._polarGridHelper().matrix.invert();
		this._polarGridHelper().matrix.multiply(this._centerMatrix);
	}
}
