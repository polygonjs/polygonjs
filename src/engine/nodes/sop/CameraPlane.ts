/**
 * Creates a plane visible by a camera.
 *
 */
import {Plane, PlaneGeometry, Vector2, Vector3, Camera} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedSopNode} from './_Base';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CoreTransform, rotateGeometry} from '../../../core/Transform';
import {BaseNodeType} from '../_Base';
import {createRaycaster} from '../../../core/RaycastHelper';

const DEFAULT = {
	direction: new Vector3(0, 1, 0),
};
const SCREEN_CORNERS = [new Vector2(-1, -1), new Vector2(-1, 1), new Vector2(1, 1), new Vector2(1, -1)];
const DEFAULT_UP = new Vector3(0, 0, 1);
const segmentsCount = new Vector2(1, 1);
const planeSize = new Vector2();
const _plane = new Plane();
const _planeCorners = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
const _planeCenter = new Vector3();

class CameraPlaneSopParamsConfig extends NodeParamsConfig {
	/** @param axis perpendicular to the plane */
	direction = ParamConfig.VECTOR3(DEFAULT.direction);
	/** @param plane offset */
	offset = ParamConfig.FLOAT(0, {
		range: [-10, 10],
		rangeLocked: [false, false],
	});
	/** @param defines if the plane resolution is sets via the number of segments or via the step size */
	useSegmentsCount = ParamConfig.BOOLEAN(true);
	/** @param step size */
	stepSize = ParamConfig.FLOAT(1, {
		range: [0.001, 1],
		rangeLocked: [false, false],
		visibleIf: {useSegmentsCount: 0},
	});
	/** @param segments count */
	segments = ParamConfig.VECTOR2([10, 10], {
		visibleIf: {useSegmentsCount: 1},
	});
	/** @param multiplies the size of the plane. This can be useful to scale down the plane. While it would cover a smaller part of the view, it would be faster to create  */
	sizeMult = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
	/** @param update on window resize  */
	updateOnWindowResize = ParamConfig.BOOLEAN(1);
	/** @param update */
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			CameraPlaneSopNode.PARAM_CALLBACK_update(node as CameraPlaneSopNode);
		},
	});
}
const ParamsConfig = new CameraPlaneSopParamsConfig();

export class CameraPlaneSopNode extends TypedSopNode<CameraPlaneSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'cameraPlane';
	}
	private _raycaster = createRaycaster();
	private _coreTransform = new CoreTransform();

	override async cook() {
		this._updateWindowControllerDependency();

		const mainCamera = await this.scene().camerasController.mainCamera();
		if (mainCamera) {
			this._computePlaneParams(mainCamera);
		} else {
			this.states.error.set('no main camera found');
		}
	}

	private _updateWindowControllerDependency() {
		if (isBooleanTrue(this.pv.updateOnWindowResize)) {
			this.addGraphInput(this.scene().viewersRegister.graphNode());
		} else {
			this.removeGraphInput(this.scene().viewersRegister.graphNode());
		}
	}

	private _computePlaneParams(camera: Camera) {
		_plane.normal.copy(this.pv.direction);
		_plane.constant = this.pv.offset;

		let i = 0;
		_planeCenter.set(0, 0, 0);
		for (const corner of SCREEN_CORNERS) {
			this._raycaster.setFromCamera(corner, camera);
			const targetCorner = _planeCorners[i];
			this._raycaster.ray.intersectPlane(_plane, targetCorner);
			_planeCenter.add(targetCorner);
			i++;
		}
		_planeCenter.multiplyScalar(0.25);
		const w0 = _planeCorners[1].distanceTo(_planeCorners[2]);
		const w1 = _planeCorners[0].distanceTo(_planeCorners[3]);
		const h0 = _planeCorners[0].distanceTo(_planeCorners[1]);
		const h1 = _planeCorners[2].distanceTo(_planeCorners[3]);
		const width = Math.max(w0, w1) * this.pv.sizeMult;
		const height = Math.max(h0, h1) * this.pv.sizeMult;

		planeSize.set(width, height);
		const geometry = this._createPlane(planeSize);

		rotateGeometry(geometry, DEFAULT_UP, this.pv.direction);

		const matrix = this._coreTransform.translationMatrix(_planeCenter);
		geometry.applyMatrix4(matrix);

		this.setGeometry(geometry);
	}

	private _createPlane(size: Vector2) {
		size = size.clone();
		if (isBooleanTrue(this.pv.useSegmentsCount)) {
			segmentsCount.x = Math.floor(this.pv.segments.x);
			segmentsCount.y = Math.floor(this.pv.segments.y);
		} else {
			if (this.pv.stepSize > 0) {
				segmentsCount.x = Math.floor(size.x / this.pv.stepSize);
				segmentsCount.y = Math.floor(size.y / this.pv.stepSize);
				size.x = segmentsCount.x * this.pv.stepSize;
				size.y = segmentsCount.y * this.pv.stepSize;
			}
		}
		return new PlaneGeometry(size.x, size.y, segmentsCount.x, segmentsCount.y);
	}

	//
	//
	// CALLBACK
	//
	//
	static PARAM_CALLBACK_update(node: CameraPlaneSopNode) {
		node._paramCallbackUpdate();
	}
	private _paramCallbackUpdate() {
		this.setDirty();
	}
}
