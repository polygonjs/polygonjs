const container = document.getElementById('polygonjs-progress-bar-container');
const barElement = document.getElementById('polygonjs-progress-bar');
const poster = document.getElementById('polygonjs-loading-poster');
export function onProgress(ratio: number) {
	if (!(barElement && container && poster)) {
		console.log('progress bar elements missing', barElement, container, poster);
		return;
	}
	if (ratio < 1) {
		barElement.style.width = `${Math.round(ratio * 100)}%`;
	} else {
		// when we reach 1, we can remove the progress bar and fade out the poster
		if (container.parentElement) {
			container.parentElement.removeChild(container);
		}
		if (poster) {
			poster.classList.add('fade-out');
			setTimeout(() => {
				if (poster.parentElement) {
					poster.parentElement.removeChild(poster);
				}
			}, 1200);
		}
	}
}
