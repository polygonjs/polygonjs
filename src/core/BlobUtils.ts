export function createObjectURL(fileOrBlob: File | Blob) {
	const urlCreator = window.URL || window.webkitURL;
	return urlCreator.createObjectURL(fileOrBlob);
}

export function downloadBlob(blob: Blob, fileName: string) {
	const urlCreator = window.URL || window.webkitURL;
	const blobUrl = urlCreator.createObjectURL(blob);

	const element = document.createElement('a');
	element.setAttribute('href', blobUrl);
	element.setAttribute('target', '_blank');
	element.setAttribute('download', fileName);

	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();

	document.body.removeChild(element);
}
