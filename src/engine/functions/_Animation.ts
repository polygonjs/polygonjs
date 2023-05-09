import {Object3D} from 'three';
import {AnimPropertyTarget} from '../../core/animation/PropertyTarget';
import {NodeContext} from '../poly/NodeContext';
import {ObjectNamedFunction1} from './_Base';
import {gsapTimeline} from '../../core/thirdParty/gsap';

const EVENT_ANIMATION_STARTED = {type: 'onAnimationStarted'};
const EVENT_ANIMATION_COMPLETED = {type: 'onAnimationCompleted'};

export class playAnimation extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'playAnimation';
	}
	func(object3D: Object3D, nodePath: string): Promise<void> {
		return new Promise(async (resolve) => {
			const node = this.scene.node(nodePath);
			if (!node) {
				return;
			}
			if (node.context() != NodeContext.ANIM) {
				return;
			}
			const container = await node.compute();
			if (!container) {
				return;
			}
			const timelineBuilder = container.coreContent();
			if (!timelineBuilder) {
				return;
			}
			// previously created timeline cannot be killed,
			// since it most likely would have been applied to a different object
			// if (this._timeline && isBooleanTrue(this.pv.stopsPreviousAnim)) {
			// 	this._timeline.kill();
			// }
			const timeline = gsapTimeline();

			const propertyTarget = new AnimPropertyTarget(this.scene, {object: {list: [object3D]}});
			timelineBuilder.populate(timeline, {registerproperties: true, propertyTarget: propertyTarget});
			timeline.vars.onStart = () => {
				object3D.dispatchEvent(EVENT_ANIMATION_STARTED);
				// this._triggerAnimationStarted(context);
			};
			timeline.vars.onComplete = () => {
				object3D.dispatchEvent(EVENT_ANIMATION_COMPLETED);
				// this._triggerAnimationCompleted(context);
			};
		});
	}
}
