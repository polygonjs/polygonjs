import {CoreUserAgent} from '../../../../../core/UserAgent';

export function defaultPixelRatio() {
	return CoreUserAgent.isMobile() ? 1 : Math.max(2, window.devicePixelRatio);
}
