export enum CoreEventEmitter {
	CANVAS = 'canvas',
	DOCUMENT = 'document',
}
export const EVENT_EMITTERS: CoreEventEmitter[] = [CoreEventEmitter.CANVAS, CoreEventEmitter.DOCUMENT];

export const EVENT_EMITTER_PARAM_MENU_OPTIONS = {
	menu: {
		entries: EVENT_EMITTERS.map((name, value) => {
			return {name, value};
		}),
	},
};
