import Stats from 'three/examples/jsm/libs/stats.module';
export abstract class StatsClass {
	public domElement!: HTMLElement;
	abstract update(): void;
}
export function createStats() {
	const stats = new (Stats as any)() as StatsClass;
	return stats;
}

import {BaseViewerType} from '../_Base';

const CALLBACK_NAME = 'viewer-stats';
export function addStatsToViewer(viewer: BaseViewerType) {
	const stats = new Stats();
	const viewerElement = viewer.domElement();
	if (!viewerElement) {
		console.warn('viewer has no element');
		return;
	}
	viewerElement.appendChild(stats.dom);

	viewer.registerOnAfterRender(CALLBACK_NAME, () => {
		stats.update();
	});
	const removeStatsFromViewer = () => {
		viewer.unRegisterOnAfterRender(CALLBACK_NAME);
	};

	return {viewerElement, stats, removeStatsFromViewer};
}
