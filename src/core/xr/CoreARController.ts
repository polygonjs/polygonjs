import {Vector3, Matrix4, Quaternion} from 'three';
import {ARButton} from 'three/examples/jsm/webxr/ARButton';
import {BaseCoreXRController} from './_BaseCoreXRController';

const s = new Vector3();

export class CoreARController extends BaseCoreXRController {
	private hitTestSource: XRHitTestSource | null = null;
	private hitTestSourceRequested = false;
	private _hitDetected = false;
	private _hitMatrix = new Matrix4();
	private _hitPosition = new Vector3();
	private _hitQuaternion = new Quaternion();

	createButton(): HTMLElement {
		return ARButton.createButton(this.renderer, {requiredFeatures: ['hit-test']});
	}
	override mount() {
		super.mount();
		this.scene.xr.setARController(this);
	}
	protected controllerName(controllerIndex: number): string {
		return `AR-Controller-${controllerIndex}`;
	}

	hitMatrix(target: Matrix4) {
		target.copy(this._hitMatrix);
	}
	hitPosition(target: Vector3) {
		target.copy(this._hitPosition);
	}
	hitQuaternion(target: Quaternion) {
		target.copy(this._hitQuaternion);
	}
	hitDetected() {
		return this._hitDetected;
	}

	override process(frame?: XRFrame) {
		super.process(frame);
		this._resolveHit(frame);
	}
	private _resolveHit(frame?: XRFrame) {
		if (!frame) {
			return;
		}
		const referenceSpace = this.renderer.xr.getReferenceSpace();
		const session = this.renderer.xr.getSession();
		if (!(session && referenceSpace)) {
			return;
		}

		if (this.hitTestSourceRequested === false) {
			session.requestReferenceSpace('viewer').then((referenceSpace) => {
				if (!session.requestHitTestSource) {
					return;
				}
				session.requestHitTestSource({space: referenceSpace})?.then((source) => {
					this.hitTestSource = source;
				});
			});

			session.addEventListener('end', () => {
				this.hitTestSourceRequested = false;
				this.hitTestSource = null;
			});

			this.hitTestSourceRequested = true;
		}

		if (!this.hitTestSource) {
			return;
		}

		const hitTestResults = frame.getHitTestResults(this.hitTestSource);
		if (hitTestResults.length) {
			const hit = hitTestResults[0];
			const pose = hit.getPose(referenceSpace);
			if (pose) {
				this._hitDetected = true;
				this._hitMatrix.fromArray(pose.transform.matrix);
				this._hitMatrix.decompose(this._hitPosition, this._hitQuaternion, s);
				return;
			}
		}
		this._hitDetected = false;
	}
}
