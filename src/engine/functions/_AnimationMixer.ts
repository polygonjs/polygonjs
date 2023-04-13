import {Object3D, AnimationMixer, AnimationAction, AnimationClip, Event, EventListener} from 'three';
import {ArrayUtils} from '../../core/ArrayUtils';
import {isBooleanTrue} from '../../core/Type';
import {
	NamedFunction1,
	NamedFunction2,
	// NamedFunction1,
	// NamedFunction2,
	NamedFunction3,
	// NamedFunction4,
	NamedFunction5,
	ObjectNamedFunction0,
} from './_Base';
//
//
// MAPS
//
//
const _mixerByObject: Map<Object3D, AnimationMixer> = new Map();
const _actionByNameByMixer: Map<AnimationMixer, Map<string, AnimationAction>> = new Map();

export function findOrCreateAnimationMixer(object3D: Object3D) {
	let animationMixer = _mixerByObject.get(object3D);
	if (!animationMixer) {
		animationMixer = new AnimationMixer(object3D);

		_mixerByObject.set(object3D, animationMixer);

		// const animations = object3D.animations;
		// if (animations) {
		// 	for (let animation of animations) {
		// 		findOrCreateAnimationAction(animationMixer, animation.name, false);
		// 	}
		// }
	}
	return animationMixer;
}
function findOrCreateAnimationAction(mixer: AnimationMixer, clipName: string, autoPlay: boolean) {
	let mixerMap = _actionByNameByMixer.get(mixer);
	if (!mixerMap) {
		mixerMap = new Map();
		_actionByNameByMixer.set(mixer, mixerMap);
	}
	let action = mixerMap.get(clipName);
	if (!action) {
		const root = mixer.getRoot();
		const animations = (root as Object3D).animations;
		if (!animations) {
			console.warn('no animations');
			return;
		}
		const animation = animations.find((animation) => animation.name == clipName);
		if (!animation) {
			return;
		}
		action = mixer.existingAction(animation) || mixer.clipAction(animation);
		if (isBooleanTrue(autoPlay)) {
			action.play();
		}

		mixerMap.set(clipName, action);
	}
	return action;
}

//
//
// FADE UTILS
//
//
type AnimationActionLoopEvent = Event & {
	type: 'loop';
} & {
	target: AnimationMixer;
} & {
	action: AnimationAction;
};

type AnimationActionEventListenerExtended = EventListener<Event, 'loop', AnimationMixer> &
	((e: AnimationActionLoopEvent) => void);

export function animationClipsFromAnimationMixer(animationMixer: AnimationMixer): AnimationClip[] | undefined {
	const root = animationMixer.getRoot();
	return (root as Object3D).animations;
}

export function existingAnimationActionsFromAnimationMixer(animationMixer: AnimationMixer): AnimationAction[] {
	const root = animationMixer.getRoot();
	const animations = (root as Object3D).animations;
	if (!animations) {
		console.warn('no animations found', root);
		return [];
	}
	const animationActions: AnimationAction[] = [];
	for (let animation of animations) {
		const existingAnimationAction = animationMixer.existingAction(animation);
		if (existingAnimationAction) {
			animationActions.push(existingAnimationAction);
		}
	}
	return animationActions;
}

export function getMostActiveAnimationActionFromMixer(animationMixer: AnimationMixer, except?: AnimationAction) {
	const existing = existingAnimationActionsFromAnimationMixer(animationMixer);
	const otherActions = existing.filter((action) => action !== except);
	const actionsSortedByWeight = ArrayUtils.sortBy(otherActions, (action) => -action.getEffectiveWeight());
	const mostActiveAnimationAction = actionsSortedByWeight[0];

	return {
		otherActions,
		mostActiveAnimationAction,
	};
}
function _setAnimationActionWeight(action: AnimationAction, weight: number) {
	action.enabled = true;
	action.setEffectiveTimeScale(1);
	action.setEffectiveWeight(weight);
}
function _crossFade(from: AnimationAction, to: AnimationAction, duration: number, warp: boolean) {
	_setAnimationActionWeight(to, 1);
	// animationActionTo.time = 0;
	to.syncWith(from);
	to.play();
	from.crossFadeTo(to, duration, warp);
}

function _fadeOutOtherActions(
	animationActionTo: AnimationAction,
	duration: number,
	warp: boolean,
	startOnFromActionEnd: boolean
) {
	const mixer = animationActionTo.getMixer();
	const {otherActions, mostActiveAnimationAction} = getMostActiveAnimationActionFromMixer(mixer, animationActionTo);
	const animationActionFrom = mostActiveAnimationAction;
	const _fadeInCurrentAndFadeOutOtherActions = () => {
		_crossFade(animationActionFrom, animationActionTo, duration, warp);

		for (let action of otherActions) {
			action.fadeOut(duration);
		}
	};

	if (otherActions.length == 0) {
		_fadeInSimple(animationActionTo, duration);
	} else {
		if (startOnFromActionEnd) {
			animationActionTo.stop();
			_fadeInWhenPreviousLoopCompleted(mixer, animationActionFrom, _fadeInCurrentAndFadeOutOtherActions);
		} else {
			_fadeInCurrentAndFadeOutOtherActions();
		}
	}
}
function _fadeInSimple(animationActionTo: AnimationAction, duration: number) {
	_setAnimationActionWeight(animationActionTo, 1);
	animationActionTo.fadeIn(duration);
}
function _fadeInWhenPreviousLoopCompleted(
	mixer: AnimationMixer,
	animationActionFrom: AnimationAction,
	callback: () => void
) {
	const onLoop: AnimationActionEventListenerExtended = ((event: AnimationActionLoopEvent) => {
		if (event.action === animationActionFrom) {
			mixer.removeEventListener('loop', onLoop);

			callback();
		}
	}) as EventListener<Event, 'loop', AnimationMixer>;
	mixer.addEventListener('loop', onLoop);
}
type GetAnimationAction = () => AnimationAction;
function startCrossFade(actionFrom: AnimationAction, actionToGet: GetAnimationAction, duration: number, warp: boolean) {
	// only request animationActionTo at the last moment,
	// in case it is set to autoPlay,
	// as it would otherwise start playing before as soon as it is created,
	// which could be way before this function is called
	// const animationActionTo = this._inputValue<ActorConnectionPointType.ANIMATION_ACTION>(
	// 	AnimationActionCrossFadeActorNodeInputName.TO,
	// 	context
	// );
	const actionTo = actionToGet();
	if (!actionTo) {
		return;
	}
	_crossFade(actionFrom, actionTo, duration, warp);
}

//
//
// FUNCTIONS
//
//
export class getAnimationMixer extends ObjectNamedFunction0 {
	static override type() {
		return 'getAnimationMixer';
	}
	func(object3D: Object3D): AnimationMixer {
		// TODO: we need to handle cases where a result is undefined
		const action = findOrCreateAnimationMixer(object3D)!;
		return action;
	}
}

export class animationMixerUpdate extends ObjectNamedFunction0 {
	static override type() {
		return 'animationMixerUpdate';
	}
	func(object3D: Object3D): void {
		const mixer = _mixerByObject.get(object3D);
		if (!mixer) {
			return;
		}
		const delta = this.scene.timeController.delta();
		const root = mixer.getRoot();
		if ((root as Object3D).traverse) {
			(root as Object3D).traverse((child) => {
				if (!child.matrixAutoUpdate) {
					child.updateMatrix();
				}
			});
		}
		mixer.update(delta);
	}
}

export class getAnimationAction extends NamedFunction3<[AnimationMixer, string, boolean]> {
	static override type() {
		return 'getAnimationAction';
	}
	func(mixer: AnimationMixer, clipName: string, autoPlay: boolean): AnimationAction {
		// TODO: we need to handle cases where a result is undefined
		const action = findOrCreateAnimationAction(mixer, clipName, autoPlay)!;
		return action;
	}
}

//
//
// Play / Stop
//
//
export class animationActionPlay extends NamedFunction1<[AnimationAction]> {
	static override type() {
		return 'animationActionPlay';
	}
	func(action: AnimationAction): void {
		if (!action) {
			return;
		}
		action.play();
	}
}
export class animationActionStop extends NamedFunction1<[AnimationAction]> {
	static override type() {
		return 'animationActionStop';
	}
	func(action: AnimationAction): void {
		if (!action) {
			return;
		}
		action.stop();
	}
}

//
//
// FadeX
//
//
export class animationActionFadeIn extends NamedFunction5<[AnimationAction, number, boolean, boolean, boolean]> {
	static override type() {
		return 'animationActionFadeIn';
	}
	func(
		action: AnimationAction,
		duration: number,
		fadeOutOtherActions: boolean,
		warp: boolean,
		startOnFromActionEnd: boolean
	): void {
		if (!action) {
			console.warn(`action '${action}' not found`);
			return;
		}
		if (fadeOutOtherActions) {
			_fadeOutOtherActions(action, duration, warp, startOnFromActionEnd);
		} else {
			_fadeInSimple(action, duration);
		}
	}
}
export class animationActionFadeOut extends NamedFunction2<[AnimationAction, number]> {
	static override type() {
		return 'animationActionFadeOut';
	}
	func(action: AnimationAction, duration: number): void {
		if (!action) {
			return;
		}
		action.fadeOut(duration);
	}
}

export class animationActionCrossFade extends NamedFunction5<
	[AnimationAction, GetAnimationAction, number, boolean, boolean]
> {
	static override type() {
		return 'animationActionCrossFade';
	}
	func(
		actionFrom: AnimationAction,
		actionToGet: GetAnimationAction,
		duration: number,
		warp: boolean,
		startOnFromActionEnd: boolean
	): void {
		if (!actionFrom) {
			return;
		}
		if (startOnFromActionEnd) {
			const mixer = actionFrom.getMixer();
			const onLoop: AnimationActionEventListenerExtended = ((event: AnimationActionLoopEvent) => {
				if (event.action === actionFrom) {
					mixer.removeEventListener('loop', onLoop);

					startCrossFade(actionFrom, actionToGet, duration, warp);
				}
			}) as EventListener<Event, 'loop', AnimationMixer>;
			mixer.addEventListener('loop', onLoop);
		} else {
			startCrossFade(actionFrom, actionToGet, duration, warp);
		}
	}
}
