/**
 * Returns a blob url from an http: or https: url
 *
 * @remarks
 * It takes 1 argument, a url to an asset online
 *
 * `blob(url)`
 *
 * - `url` is a string, starting with http:// or https://
 *
 * ## Usage
 *
 * - `url('https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/textures/markertracking/marker_tracking1.png')` - return a url like blob:http://localhost:5000/af3f2f10-8de4-463e-9d83-82d24287f071
 *
 */
import {BaseMethod} from './_Base';

async function blobFromUrl(url: string) {
	const response = await fetch(url);
	const blob = await response.blob();
	const urlCreator = window.URL || window.webkitURL;
	const blobUrl = urlCreator.createObjectURL(blob);
	return blobUrl;
}

export class BlobExpression extends BaseMethod {
	static override requiredArguments() {
		return [['string', 'url']];
	}

	override async processArguments(args: any[]): Promise<string> {
		if (args.length >= 1) {
			const url = args[0] as string;
			return await blobFromUrl(url);
		}
		return '';
	}
}
