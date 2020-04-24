export class CoreLoaderUtils {
	static append_timestamp_to_url(url: string): string {
		const timestamp = Date.now();
		const params_query = `t=${timestamp}`;
		if (url.includes('?')) {
			url = `${url}&${params_query}`;
		} else {
			url = `${url}?${params_query}`;
		}
		return url;
	}
}
