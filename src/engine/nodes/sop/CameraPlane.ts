/**
 * Creates a plane visible by a camera.
 *
 */
import {Vector3} from 'three';
import {Vector2} from 'three';
import {PlaneGeometry} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CameraNodeType, NodeContext, CAMERA_TYPES} from '../../poly/NodeContext';
import {TypedSopNode} from './_Base';
import {Plane} from 'three';
import {OrthographicCamera} from 'three';
import {PerspectiveCamera} from 'three';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CoreTransform, rotateGeometry} from '../../../core/Transform';
import {BaseNodeType} from '../_Base';
import {createRaycaster} from '../../../core/RaycastHelper';

type CameraType = OrthographicCamera | PerspectiveCamera;
const DEFAULT = {
	direction: new Vector3(0, 1, 0),
};
const SCREEN_CORNERS = [new Vector2(-1, -1), new Vector2(-1, 1), new Vector2(1, 1), new Vector2(1, -1)];
const DEFAULT_UP = new Vector3(0, 0, 1);
class CameraPlaneSopParamsConfig extends NodeParamsConfig {
	/** @param camera */
	camera = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: CAMERA_TYPES,
		},
	});
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
	private _plane = new Plane();
	private _raycaster = createRaycaster();
	private _planeCorners = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
	private _planeCenter = new Vector3();
	private _coreTransform = new CoreTransform();

	override cook() {
		this._updateWindowControllerDependency();

		const foundNode = this.pv.camera.nodeWithContext(NodeContext.OBJ);
		if (!foundNode) {
			this.states.error.set(`no camera found`);
			this.cookController.endCook();
			return;
		}
		if (!CAMERA_TYPES.includes(foundNode.type() as CameraNodeType)) {
			this.states.error.set(`node found is not a camera`);
			this.cookController.endCook();
			return;
		}
		const camera = foundNode.object as CameraType;
		this._computePlaneParams(camera);
	}

	private _updateWindowControllerDependency() {
		if (isBooleanTrue(this.pv.updateOnWindowResize)) {
			this.addGraphInput(this.scene().windowController.graphNode());
		} else {
			this.removeGraphInput(this.scene().windowController.graphNode());
		}
	}

	private _computePlaneParams(camera: CameraType) {
		this._plane.normal.copy(this.pv.direction);
		this._plane.constant = this.pv.offset;

		let i = 0;
		this._planeCenter.set(0, 0, 0);
		for (const corner of SCREEN_CORNERS) {
			this._raycaster.setFromCamera(corner, camera);
			const targetCorner = this._planeCorners[i];
			this._raycaster.ray.intersectPlane(this._plane, targetCorner);
			this._planeCenter.add(targetCorner);
			i++;
		}
		this._planeCenter.multiplyScalar(0.25);
		const w0 = this._planeCorners[1].distanceTo(this._planeCorners[2]);
		const w1 = this._planeCorners[0].distanceTo(this._planeCorners[3]);
		const h0 = this._planeCorners[0].distanceTo(this._planeCorners[1]);
		const h1 = this._planeCorners[2].distanceTo(this._planeCorners[3]);
		const width = Math.max(w0, w1) * this.pv.sizeMult;
		const height = Math.max(h0, h1) * this.pv.sizeMult;

		this.planeSize.set(width, height);
		const geometry = this._createPlane(this.planeSize);

		rotateGeometry(geometry, DEFAULT_UP, this.pv.direction);

		const matrix = this._coreTransform.translationMatrix(this._planeCenter);
		geometry.applyMatrix4(matrix);

		this.setGeometry(geometry);
	}

	private segments_count = new Vector2(1, 1);
	private planeSize = new Vector2();
	private _createPlane(size: Vector2) {
		size = size.clone();
		if (isBooleanTrue(this.pv.useSegmentsCount)) {
			this.segments_count.x = Math.floor(this.pv.segments.x);
			this.segments_count.y = Math.floor(this.pv.segments.y);
		} else {
			if (this.pv.stepSize > 0) {
				this.segments_count.x = Math.floor(size.x / this.pv.stepSize);
				this.segments_count.y = Math.floor(size.y / this.pv.stepSize);
				size.x = this.segments_count.x * this.pv.stepSize;
				size.y = this.segments_count.y * this.pv.stepSize;
			}
		}
		return new PlaneGeometry(size.x, size.y, this.segments_count.x, this.segments_count.y);
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
