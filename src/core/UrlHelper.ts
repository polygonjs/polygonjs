export class UrlHelper {
	static sanitize(url: string) {
		return url.replace(/([^:])\/\//g, '$1/');
	}
}
