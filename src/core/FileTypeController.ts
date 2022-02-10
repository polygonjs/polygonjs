export const VIDEO_EXTENSIONS = ['mp4', 'ogv', 'ogg'];
export enum ImageExtension {
	JPG = 'jpg',
	JPEG = 'jpeg',
	PNG = 'png',
	EXR = 'exr',
	KTX2 = 'ktx2',
	HDR = 'hdr',
}
export const IMAGE_EXTENSIONS: string[] = [
	ImageExtension.JPEG,
	ImageExtension.JPG,
	ImageExtension.PNG,
	ImageExtension.EXR,
	ImageExtension.KTX2,
	ImageExtension.HDR,
];

function urlExt(url: string) {
	const url_without_query_params = url.split('?')[0];
	const url_elements = url_without_query_params.split('.');
	const ext = url_elements[url_elements.length - 1];
	return ext;
}

export function isUrlVideo(url: string) {
	return VIDEO_EXTENSIONS.includes(urlExt(url).toLowerCase());
}
export function isUrlStaticImage(url: string) {
	return IMAGE_EXTENSIONS.includes(urlExt(url).toLowerCase());
}
export function isUrlGif(url: string) {
	return urlExt(url).toLowerCase() == 'gif';
}
