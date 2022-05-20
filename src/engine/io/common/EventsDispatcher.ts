export enum PolyEventName {
	POLY_PROGRESS = 'POLYProgress',
	SCENE_CREATED = 'POLYSceneCreated',
	VIEWER_MOUNTED = 'POLYViewerMounted',
	SCENE_READY = 'POLYSceneReady',
	VIEWER_READY = 'POLYViewerReady',
}

export class PolyEventsDispatcher {
	static dispatchProgressEvent(progress: number, sceneName?: string) {
		const createEvent = (eventName: string) => {
			return new CustomEvent(eventName, {
				detail: {
					progress,
				},
			});
		};
		document.dispatchEvent(createEvent(PolyEventName.POLY_PROGRESS));
		document.dispatchEvent(createEvent(`${PolyEventName.POLY_PROGRESS}-${sceneName}`));
	}
}
