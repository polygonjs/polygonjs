export function sanitizeUrl(url: string) {
	return url.replace(/([^:]\/)\/+/g, '$1').replace(/^\/+/, '/');
}
