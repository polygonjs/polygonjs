export function createObjectURL(fileOrBlob: File | Blob) {
	const urlCreator = window.URL || window.webkitURL;
	return urlCreator.createObjectURL(fileOrBlob);
}
