// import jimp from 'jimp';
// jimp.js is now async,
// and created via packs/jimp.ts

// import {Texture} from 'three/src/textures/Texture'
// import {Color} from 'three/src/math/Color'

export class CoreImage {
	// constructor() {}

	// https://stackoverflow.com/questions/6765370/merge-image-using-javascript
	static overlay(img0: HTMLImageElement, img1: HTMLImageElement): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			let canvas = document.createElement('canvas');
			canvas.width = Math.max(img0.width, img1.width);
			canvas.height = Math.max(img0.height, img1.height);
			let context = canvas.getContext('2d') as CanvasRenderingContext2D;

			context.drawImage(img0, 0, 0, img0.width, img0.height);
			context.drawImage(img1, 0, 0, img1.width, img1.height);
			const datauri = canvas.toDataURL('image/png');
			const img = new Image();
			img.onload = () => {
				resolve(img);
			};
			img.src = datauri;
		});
	}

	// static image_from_path(url: string): Promise<HTMLImageElement> {
	// 	return new Promise((resolve, reject) => {
	// 		const img = new Image();

	// 		img.onload = function() {
	// 			resolve(img);
	// 		};

	// 		img.src = url;
	// 	});
	// }
	// static image_from_color(color: THREE.Color, width: number, height: number): Promise<HTMLImageElement> {
	// 	return new Promise((resolve, reject) => {
	// 		const image = new Image();

	// 		const canvas = document.createElement('canvas');
	// 		canvas.width = width;
	// 		canvas.height = height;
	// 		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
	// 		context.fillStyle = color.getStyle();
	// 		context.fillRect(0, 0, canvas.width, canvas.height);
	// 		const data_url = canvas.toDataURL();
	// 		image.onload = () => {
	// 			resolve(image);
	// 		};
	// 		image.src = data_url;
	// 	});
	// }
	// static image_from_texture(texture: THREE.Texture): Promise<HTMLImageElement | null> {
	// 	return new Promise((resolve, reject) => {
	// 		if (texture.image) {
	// 			if (texture.image.data) {
	// 				const image = new Image();
	// 				image.width = texture.image.width;
	// 				image.height = texture.image.height;
	// 				const datauri = this.image_data_to_data_uri(texture.image);
	// 				image.onload = () => {
	// 					resolve(image);
	// 				};
	// 				image.src = datauri;
	// 			} else {
	// 				resolve(texture.image);
	// 			}
	// 		} else {
	// 			resolve(null);
	// 		}
	// 	});
	// }
	// static image_to_datauri(image: HTMLImageElement): string {
	// 	const canvas = document.createElement('canvas');
	// 	canvas.width = image.width;
	// 	canvas.height = image.height;
	// 	const context = canvas.getContext('2d') as CanvasRenderingContext2D;
	// 	// context.fillRect(0, 0, canvas.width, canvas.height)
	// 	context.drawImage(image, 0, 0);
	// 	return canvas.toDataURL();
	// }
	// static image_data_to_data_uri(image_data: ImageData): string {
	// 	const canvas = document.createElement('canvas');
	// 	const context = canvas.getContext('2d') as CanvasRenderingContext2D;
	// 	canvas.width = image_data.width;
	// 	canvas.height = image_data.height;

	// 	// let stride
	// 	// let color
	// 	// lodash_times(canvas.width, (w)=>{
	// 	// 	lodash_times(canvas.height, (h)=>{
	// 	// 		stride = 4 * (w + h*w)
	// 	// 		color = new THREE.Color(
	// 	// 			image_data.data[stride],
	// 	// 			image_data.data[stride+1],
	// 	// 			image_data.data[stride+2]
	// 	// 		)
	// 	// 		context.fillStyle = color.getStyle()
	// 	// 		context.fillRect(w, h, 1, 1)
	// 	// 	})
	// 	// })

	// 	// const color = new THREE.Color(0,1,1)
	// 	// context.fillStyle = color.getStyle()
	// 	// context.fillRect(0, 0, canvas.width, canvas.height)
	// 	// // context.putImageData(image_data.data, 0, 0)
	// 	const context_imaged_data = context.getImageData(0, 0, canvas.width, canvas.height);
	// 	// image_data.data = image_data.data.map(d=>d*255)
	// 	context_imaged_data.data.set(image_data.data.map((d) => d * 255));
	// 	context.putImageData(context_imaged_data, 0, 0);
	// 	// document.body.appendChild(canvas)
	// 	// document.body.style.overflow = 'auto'
	// 	return canvas.toDataURL();
	// }
	// static datauri_from_texture(texture: THREE.Texture): string | null {
	// 	if (texture.image) {
	// 		if (texture.image.data) {
	// 			return this.image_data_to_data_uri(texture.image);
	// 		} else {
	// 			return this.image_to_datauri(texture.image);
	// 		}
	// 	} else {
	// 		console.warn(texture);
	// 		return null;
	// 	}
	// }

	static create_white_image(width: number, height: number): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			let canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			let context = canvas.getContext('2d') as CanvasRenderingContext2D;
			context.beginPath();
			context.rect(0, 0, width, height);
			context.fillStyle = 'white';
			context.fill();
			const datauri = canvas.toDataURL('image/png');
			const img = new Image();
			img.onload = () => {
				resolve(img);
			};
			img.src = datauri;
		});
	}
	static make_square(src_img: HTMLImageElement): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			let canvas = document.createElement('canvas');
			const size = Math.min(src_img.width, src_img.height);
			const ratio = src_img.width / src_img.height;
			canvas.width = size;
			canvas.height = size;
			let context = canvas.getContext('2d') as CanvasRenderingContext2D;

			const is_landscape = ratio > 1;
			const margin = is_landscape ? (src_img.width - size) / 2 : (src_img.height - size) / 2;

			if (is_landscape) {
				context.drawImage(src_img, margin, 0, size, size, 0, 0, size, size);
			} else {
				context.drawImage(src_img, 0, margin, size, size, 0, 0, size, size);
			}

			const datauri = canvas.toDataURL('image/png');
			const img = new Image();
			img.onload = () => {
				resolve(img);
			};
			img.src = datauri;
		});
	}

	// static async cover(img: HTMLImageElement, width: number, height: number){
	// 	await CoreScriptLoader.load_jimp()
	// 	const jimp_img = await self.jimp.read(img.src)
	// 	return jimp_img.cover(width, height)
	// }

	// static async jimp_to_img(jimp_img): Promise<HTMLImageElement>{
	// 	return new Promise(async (resolve, reject)=>{
	// 		await CoreScriptLoader.load_jimp()
	// 		jimp_img.getBase64(self.jimp.MIME_PNG, (err, src) => {
	// 			const img = document.createElement('img');
	// 			img.onload = ()=>{
	// 				resolve(img)
	// 			}
	// 			img.src = src
	// 		})
	// 	})
	// }

	static async image_to_blob(img: HTMLImageElement): Promise<Blob> {
		return new Promise(function (resolve, reject) {
			try {
				let xhr = new XMLHttpRequest();
				xhr.open('GET', img.src);
				xhr.responseType = 'blob';
				xhr.onerror = function () {
					reject('Network error.');
				};
				xhr.onload = function () {
					if (xhr.status === 200) {
						resolve(xhr.response);
					} else {
						reject('Loading error:' + xhr.statusText);
					}
				};
				xhr.send();
			} catch (err) {
				reject(err.message);
			}
		});
	}

	static data_from_url(url: string): Promise<ImageData> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = 'Anonymous';
			img.onload = () => {
				const data = this.data_from_image(img);
				resolve(data);
			};
			img.src = url;
		});
	}
	static data_from_image(img: HTMLImageElement): ImageData {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
		context.drawImage(img, 0, 0, img.width, img.height);
		return context.getImageData(0, 0, img.width, img.height);
	}
}
