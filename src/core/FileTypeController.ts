export const VIDEO_EXTENSIONS = ['mp4', 'ogv', 'ogg'];
export enum ImageExtension {
	GIF = 'gif',
	JPG = 'jpg',
	JPEG = 'jpeg',
	PNG = 'png',
	EXR = 'exr',
	KTX2 = 'ktx2',
	HDR = 'hdr',
}
export const IMAGE_EXTENSIONS: string[] = [
	ImageExtension.GIF,
	ImageExtension.JPEG,
	ImageExtension.JPG,
	ImageExtension.PNG,
	ImageExtension.EXR,
	ImageExtension.KTX2,
	ImageExtension.HDR,
];
export enum GeometryExtension {
	DRC = 'drc',
	FBX = 'fbx',
	GLTF = 'gltf',
	GLB = 'glb',
	JSON = 'json',
	MPD = 'mpd',
	OBJ = 'obj',
	PDB = 'pdb',
	PLY = 'ply',
	STL = 'stl',
	SVG = 'svg',
}
export const GEOMETRY_EXTENSIONS: string[] = [
	GeometryExtension.DRC,
	GeometryExtension.FBX,
	GeometryExtension.GLTF,
	GeometryExtension.GLB,
	GeometryExtension.JSON,
	GeometryExtension.MPD,
	GeometryExtension.OBJ,
	GeometryExtension.PDB,
	GeometryExtension.PLY,
	GeometryExtension.STL,
];

function urlExt(url: string) {
	const url_without_query_params = url.split('?')[0];
	const url_elements = url_without_query_params.split('.');
	if (url_elements.length == 1) {
		return;
	}
	const ext = url_elements[url_elements.length - 1];
	return ext;
}
export function isExtVideo(ext: string) {
	return VIDEO_EXTENSIONS.includes(ext);
}
export function isExtStaticImage(ext: string) {
	return IMAGE_EXTENSIONS.includes(ext);
}
export function isExtGif(ext: string) {
	return ext == 'gif';
}
export function isExtGeometry(ext: string) {
	return GEOMETRY_EXTENSIONS.includes(ext);
}
export function isUrlVideo(url: string): boolean {
	const ext = urlExt(url);
	return ext != null ? isExtVideo(ext.toLowerCase()) : false;
}
export function isUrlStaticImage(url: string) {
	const ext = urlExt(url);
	return ext != null ? isExtStaticImage(ext.toLowerCase()) : false;
}
export function isUrlGif(url: string) {
	const ext = urlExt(url);
	return ext != null ? isExtGif(ext.toLowerCase()) : false;
}
export function isUrlGeometry(url: string) {
	const ext = urlExt(url);
	return ext != null ? isExtGeometry(ext.toLowerCase()) : false;
}
