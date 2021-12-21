const poster = document.getElementById('polygonjs-loading-poster');
const container = document.getElementById('polygonjs-progress-bar-container');
const mainElement = document.getElementById('polygonjs-progress');
const barElement = document.getElementById('polygonjs-progress-bar-label');
export function onProgress(ratio: number) {
	if (!(mainElement && barElement && container && poster)) {
		console.log('progress bar elements missing');
		return;
	}
	if (ratio < 1) {
		mainElement.style.width = `${Math.round(ratio * 100)}%`;
		barElement.innerText = `${Math.round(ratio * 100)}%`;
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
