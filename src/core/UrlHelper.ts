export class UrlHelper {
	static sanitize(url: string) {
		return url.replace(/([^:])\/\//g, '$1/');
	}

	static urlParam(paramName: string) {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		return urlParams.get(paramName);
	}
}
