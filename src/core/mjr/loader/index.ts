import {DOMParser} from '@xmldom/xmldom';
import {VoxHelper} from '../helpers/Vox';

export class Loader {
	static async xml(path: string) {
		const res = await fetch(path);
		if (res.status !== 200) return null;
		const text = await res.text();
		try {
			return {text, elem: this.xmlParse(text)};
		} catch (e) {
			console.error(e);
			return null;
		}
	}

	static xmlParse(text: string) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, 'text/xml');
		return doc.documentElement;
	}

	static async vox(path: string): Promise<[Int32Array | null, number, number, number]> {
		const res = await fetch(path);
		if (res.status !== 200) return [null, -1, -1, -1];
		const buf = await res.arrayBuffer();
		try {
			return VoxHelper.read(buf);
		} catch (e) {
			console.error(e);
			return [null, -1, -1, -1];
		}
	}

	static async bitmap(url: string): Promise<[Int32Array | null, number, number, number]> {
		try {
			const response = await fetch(url);
			const fileBlob = await response.blob();
			const bitmap = await createImageBitmap(fileBlob);

			const canvas = document.createElement('canvas');

			canvas.width = bitmap.width;
			canvas.height = bitmap.height;

			const context = canvas.getContext('2d')!;
			context.drawImage(bitmap, 0, 0);
			bitmap.close();

			const {data, width, height} = context.getImageData(0, 0, canvas.width, canvas.height);

			return [new Int32Array(data.buffer), width, height, 1];
		} catch (e) {
			console.error(e);
			return [null, -1, -1, -1];
		}
	}

	static makeCanvas() {
		return document.createElement('canvas');
	}

	static makeImageData(x: number, y: number) {
		return new ImageData(x, y);
	}
}
