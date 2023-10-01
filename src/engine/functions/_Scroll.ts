import ScrollTrigger from 'gsap/ScrollTrigger';
import {gsap} from '../../core/thirdParty/gsap/gsap';
gsap.registerPlugin(ScrollTrigger);
//
import {Ref} from '@vue/reactivity';
import {NamedFunction4} from './_Base';
import {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';
import {ScrollEvent, SCROLL_EVENTS, CallbackByScrollEvent, CreateScrollTriggerOptions} from '../../core/scroll/Common';

function _createScrollListener(
	createOptions: CreateScrollTriggerOptions,
	listeners: CallbackByScrollEvent,
	progressRef: Ref<number>
): globalThis.ScrollTrigger {
	const {useViewport, scroller, displayMarkers, nodePath} = createOptions;

	const _getScroller = () => {
		if (useViewport) {
			console.log('useViewport is true, not finding scroller');
			return;
		}
		const scrollerElement = document.querySelector(scroller);
		if (!scrollerElement) {
			console.log(`no scrollerElement element found with selector '${scroller}'`);
			return;
		}
		return scrollerElement;
	};

	const element = document.querySelector(createOptions.element);
	const options: ScrollTrigger.StaticVars = {
		trigger: element,
		scroller: _getScroller(),
		markers: displayMarkers,
		id: nodePath,
	};

	for (let eventName of SCROLL_EVENTS) {
		const listener = listeners[eventName];
		options[eventName] = listener;
	}
	options.onUpdate = (progress) => {
		progressRef.value = progress.progress;
		const listener = listeners[ScrollEvent.onUpdate];
		listener();
	};
	const scrollTrigger = ScrollTrigger.create(options);
	return scrollTrigger;
}

export class createScrollListener extends NamedFunction4<
	[CreateScrollTriggerOptions, CallbackByScrollEvent, ActorEvaluator, Ref<number>]
> {
	static override type() {
		return 'createScrollListener';
	}
	func(
		createOptions: CreateScrollTriggerOptions,
		listeners: CallbackByScrollEvent,
		evaluator: ActorEvaluator,
		progressRef: Ref<number>
	): void {
		const scrollTrigger = _createScrollListener(createOptions, listeners, progressRef);

		evaluator.onDispose(() => {
			scrollTrigger.kill();
		});
	}
}
