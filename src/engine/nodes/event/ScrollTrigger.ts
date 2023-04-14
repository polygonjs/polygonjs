/**
 * Triggers events based on page scroll
 *
 *
 * @remarks
 *
 * In order to test the [event/ScrollTrigger](/docs/nodes/event/ScrollTrigger) node, you can create the following setup:
 *
 * Using Polygonjs [local app](/local), add the following line to the `EditorConfig.ts` file, inside the `configureEditor` function:
 *
 * ```
 * options.api.panel.viewer.setData({viewerId: 'my-viewer', html: require('./viewer.html')})
 * ```
 *
 * and create a file `viewer.html` in the same folder as `EditorConfig.ts`, containing the following:
 *
 * ```<div id="main-container" style="position: relative; height: 100%">
 *	<div id="my-viewer" style="position: absolute; width: 100%; height: 100%"></div>
 *	<div id="scroll-container" style="position: relative; height: 100%; overflow-y: scroll">
 *		<div id="checkpoint1" style="height: 400px; color: white">checkpoint 1</div>
 *		<div id="checkpoint2" style="height: 400px; color: red">checkpoint 2</div>
 *		<div id="checkpoint3" style="height: 400px; color: green">checkpoint 3</div>
 *		<div id="checkpoint4" style="height: 400px; color: lightred">checkpoint 4</div>
 *	</div>
 * </div>```
 *
 * Then reload the editor. You will then see the viewer with a scrollbar and other divs inside.
 *
 * Then create a [event/ScrollTrigger](/docs/nodes/event/ScrollTrigger) node, and set its parameters as follow:
 *
 * - param `element` to `#checkpoint2`
 * - param `useViewport` to `false`
 * - param `scroller` to `#scroll-container`
 * - param `markers` to `true`
 *
 * You should now be able to connect other event nodes to the outputs of the scrollTrigger node,
 * and have those be triggered as you scroll.
 *
 */
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {isBooleanTrue} from '../../../core/Type';
import {VisibleIfParamOptions} from '../../params/utils/OptionsController';

import ScrollTrigger from 'gsap/ScrollTrigger';
import {BaseNodeType} from '../_Base';
import {gsap} from '../../../core/thirdParty/gsap';
gsap.registerPlugin(ScrollTrigger);

enum ScrollTriggerNodeInput {
	CREATE = 'create',
	DISPOSE = 'dispose',
}
enum ScrollTriggerNodeOutput {
	TOGGLE = 'toggle',
	ENTER = 'enter',
	LEAVE = 'leave',
	ENTER_BACK = 'enterBack',
	LEAVE_BACK = 'leaveBack',
}

interface DefaultParamOptionsOptions {
	visibleIf?: VisibleIfParamOptions;
}

const defaultParamOptions = (options?: DefaultParamOptionsOptions) => {
	let visibleIf: VisibleIfParamOptions | undefined = options?.visibleIf;
	if (visibleIf) {
		visibleIf.active = 1;
	} else {
		visibleIf = {active: 1};
	}

	return {
		visibleIf,
		callback: (node: BaseNodeType) => {
			ScrollTriggerEventNode.PARAM_CALLBACK_updateScrollTrigger(node as ScrollTriggerEventNode);
		},
	};
};
const UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS = defaultParamOptions();

class ScrollTriggerParamsConfig extends NodeParamsConfig {
	/** @param active */
	active = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			ScrollTriggerEventNode.PARAM_CALLBACK_updateScrollTrigger(node as ScrollTriggerEventNode);
		},
	});
	/** @param selector of the element the scroll events are detected for */
	element = ParamConfig.STRING('', UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS);
	/** @param use viewport as scroller */
	useViewport = ParamConfig.BOOLEAN(1, UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS);
	/** @param override the scroller */
	scroller = ParamConfig.STRING('', defaultParamOptions({visibleIf: {useViewport: 0}}));
	/** @param add markers for debugging */
	markers = ParamConfig.BOOLEAN('!playerMode()', {
		...UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS,
		separatorAfter: true,
	});
	/** @param define if progress should be updated */
	tprogress = ParamConfig.BOOLEAN(0, UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS);
	/** @param progress */
	progress = ParamConfig.FLOAT(0, {
		editable: false,
		visibleIf: {tprogress: 1},
	});
	/** @param define if the scroll is inside the element */
	tinsideElement = ParamConfig.BOOLEAN(0, UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS);
	/** @param 1 if the scroll is inside the element */
	insideElement = ParamConfig.BOOLEAN(0, {
		editable: false,
		visibleIf: {tinsideElement: 1},
	});
	/** @param sends a trigger when we leaving or entering the element */
	onToggle = ParamConfig.BOOLEAN(1, {
		...UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS,
		separatorBefore: true,
	});
	/** @param sends a trigger when entering the element */
	onEnter = ParamConfig.BOOLEAN(0, UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS);
	/** @param sends a trigger when leaving the element */
	onLeave = ParamConfig.BOOLEAN(0, UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS);
	/** @param sends a trigger when entering again the element */
	onEnterBack = ParamConfig.BOOLEAN(0, UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS);
	/** @param sends a trigger when leaving again the element */
	onLeaveBack = ParamConfig.BOOLEAN(0, UPDATE_SCROLL_TRIGGER_PARAM_OPTIONS);
}
const ParamsConfig = new ScrollTriggerParamsConfig();

export class ScrollTriggerEventNode extends TypedEventNode<ScrollTriggerParamsConfig> {
	override paramsConfig = ParamsConfig;
	public gsap = gsap; // give access to gsap to external scripts
	public ScrollTrigger = ScrollTrigger; // give access to ScrollTrigger to external scripts
	static override type() {
		return 'scrollTrigger';
	}

	override dispose() {
		this._disposeScrollTrigger();
		super.dispose();
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				ScrollTriggerNodeInput.CREATE,
				EventConnectionPointType.BASE,
				this._onCreateTrigger.bind(this)
			),
			new EventConnectionPoint(
				ScrollTriggerNodeInput.DISPOSE,
				EventConnectionPointType.BASE,
				this._onDisposeTrigger.bind(this)
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(ScrollTriggerNodeOutput.TOGGLE, EventConnectionPointType.BASE),
			new EventConnectionPoint(ScrollTriggerNodeOutput.ENTER, EventConnectionPointType.BASE),
			new EventConnectionPoint(ScrollTriggerNodeOutput.LEAVE, EventConnectionPointType.BASE),
			new EventConnectionPoint(ScrollTriggerNodeOutput.ENTER_BACK, EventConnectionPointType.BASE),
			new EventConnectionPoint(ScrollTriggerNodeOutput.LEAVE_BACK, EventConnectionPointType.BASE),
		]);
	}
	private _scrollTrigger: globalThis.ScrollTrigger | undefined;
	private _onCreateTrigger(eventContext: EventContext<Event>) {
		this._disposeScrollTrigger();

		if (!isBooleanTrue(this.pv.active)) {
			return;
		}
		this.states.error.clear();

		const element = this._querySelector(this.pv.element);
		if (!element) {
			return;
		}

		// If the scroller element is not found, this function returns undefined,
		// and then the scroll container will be assumed to be the window by gsap.
		// This can be handy in cases where we want to use a container in the editor,
		// but want to use the window once deployed
		const _getScroller = () => {
			if (isBooleanTrue(this.pv.useViewport)) {
				return;
			}
			const scrollerElement = this._querySelector(this.pv.scroller);
			if (!scrollerElement) {
				return;
			}
			return scrollerElement;
		};

		const options: ScrollTrigger.StaticVars = {
			trigger: element,
			scroller: _getScroller(),
			markers: this.pv.markers,
			id: this.path(),
		};
		if (isBooleanTrue(this.pv.tinsideElement) || isBooleanTrue(this.pv.onToggle)) {
			const updateInside = (scrollTrigger: globalThis.ScrollTrigger) =>
				this.p.insideElement.set(scrollTrigger.isActive);
			const dispatchOnToggle = (scrollTrigger: globalThis.ScrollTrigger) =>
				this.dispatchEventToOutput(ScrollTriggerNodeOutput.TOGGLE, {});
			const functions: Array<(scrollTrigger: globalThis.ScrollTrigger) => void> = [];
			if (isBooleanTrue(this.pv.tinsideElement)) {
				functions.push(updateInside);
			}
			if (isBooleanTrue(this.pv.onToggle)) {
				functions.push(dispatchOnToggle);
			}
			options.onToggle = (scrollTrigger) => {
				for (let func of functions) {
					func(scrollTrigger);
				}
			};
		}
		if (isBooleanTrue(this.pv.onEnter)) {
			options.onEnter = () => this.dispatchEventToOutput(ScrollTriggerNodeOutput.ENTER, {});
		}
		if (isBooleanTrue(this.pv.onLeave)) {
			options.onLeave = () => this.dispatchEventToOutput(ScrollTriggerNodeOutput.LEAVE, {});
		}
		if (isBooleanTrue(this.pv.onEnterBack)) {
			options.onEnterBack = () => this.dispatchEventToOutput(ScrollTriggerNodeOutput.ENTER_BACK, {});
		}
		if (isBooleanTrue(this.pv.onLeaveBack)) {
			options.onLeaveBack = () => this.dispatchEventToOutput(ScrollTriggerNodeOutput.LEAVE_BACK, {});
		}

		if (isBooleanTrue(this.pv.tprogress)) {
			options.onUpdate = (scrollTrigger) => {
				this.p.progress.set(scrollTrigger.progress);
			};
		}

		this._scrollTrigger = ScrollTrigger.create(options);
	}
	private _updateScrollTrigger() {
		if (!this._scrollTrigger) {
			return;
		}
		this._onCreateTrigger({});
	}

	private _onDisposeTrigger(eventContext: EventContext<Event>) {
		this._disposeScrollTrigger();
	}

	private _disposeScrollTrigger() {
		if (!this._scrollTrigger) {
			return;
		}
		this._scrollTrigger.kill();
	}
	private _querySelector(selector: string) {
		const element = document.querySelector(selector);
		if (!element) {
			this.states.error.set(`element with selector '${selector}' not found`);
			return;
		}
		return element;
	}

	static PARAM_CALLBACK_updateScrollTrigger(node: ScrollTriggerEventNode) {
		node._updateScrollTrigger();
	}
}
