export const VIDEO_EXTENSIONS = ['mp4', 'ogv', 'ogg', 'webm'];
export enum ImageExtension {
	GIF = 'gif',
	JPG = 'jpg',
	JPEG = 'jpeg',
	PNG = 'png',
	EXR = 'exr',
	KTX2 = 'ktx2',
	HDR = 'hdr',
	WEBP = 'webp',
}
export const IMAGE_EXTENSIONS: string[] = [
	ImageExtension.GIF,
	ImageExtension.JPEG,
	ImageExtension.JPG,
	ImageExtension.PNG,
	ImageExtension.EXR,
	ImageExtension.KTX2,
	ImageExtension.HDR,
	ImageExtension.WEBP,
];
export enum GeometryExtension {
	DRC = 'drc',
	FBX = 'fbx',
	GEOJSON = 'geojson',
	GLTF = 'gltf',
	GLB = 'glb',
	IFC = 'ifc',
	JSON = 'json',
	MPD = 'mpd',
	OBJ = 'obj',
	PDB = 'pdb',
	PLY = 'ply',
	STEP = 'step',
	STL = 'stl',
	SVG = 'svg',
	USDZ = 'usdz',
	VOX = 'vox',
}
export const GEOMETRY_EXTENSIONS: string[] = [
	GeometryExtension.DRC,
	GeometryExtension.FBX,
	GeometryExtension.GEOJSON,
	GeometryExtension.GLTF,
	GeometryExtension.GLB,
	GeometryExtension.IFC,
	GeometryExtension.JSON,
	GeometryExtension.MPD,
	GeometryExtension.OBJ,
	GeometryExtension.PDB,
	GeometryExtension.PLY,
	GeometryExtension.STEP,
	GeometryExtension.STL,
	GeometryExtension.SVG,
	GeometryExtension.USDZ,
	GeometryExtension.VOX,
];
export enum SDFExtension {
	BIN = 'bin',
}
export const SDF_EXTENSIONS: string[] = [SDFExtension.BIN];

export enum AudioExtension {
	MP3 = 'mp3',
	WAV = 'wav',
	OGG = 'ogg',
}
export const AUDIO_EXTENSIONS: string[] = [AudioExtension.MP3, AudioExtension.WAV, AudioExtension.OGG];

export enum FontExtension {
	TTF = 'ttf',
	JSON = 'json',
}
export const FONT_EXTENSIONS: string[] = [FontExtension.TTF, FontExtension.JSON];

function urlExt(url: string) {
	const url_without_query_params = url.split('?')[0];
	const url_elements = url_without_query_params.split('.');
	if (url_elements.length == 1) {
		return;
	}
	const ext = url_elements[url_elements.length - 1];
	return ext;
}
/**
 *
 * isExt...
 *
 */
export function isExtVideo(ext: string) {
	return VIDEO_EXTENSIONS.includes(ext);
}
export function isExtStaticImage(ext: string) {
	return IMAGE_EXTENSIONS.includes(ext);
}
export function isExtGif(ext: string) {
	return ext == ImageExtension.GIF;
}
export function isExtGeometry(ext: string) {
	return GEOMETRY_EXTENSIONS.includes(ext);
}
export function isExtSDF(ext: string) {
	return SDF_EXTENSIONS.includes(ext);
}
export function isExtAudio(ext: string) {
	return AUDIO_EXTENSIONS.includes(ext);
}
/**
 *
 * isUrl...
 *
 */
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
export function isUrlAudio(url: string) {
	const ext = urlExt(url);
	return ext != null ? isExtAudio(ext.toLowerCase()) : false;
}
