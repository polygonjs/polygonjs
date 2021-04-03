export class DomEffects {
	static fadeOut(element: HTMLElement): Promise<void> {
		return new Promise((resolve) => {
			const fadeEffect = setInterval(() => {
				if (!element.style.opacity) {
					element.style.opacity = '1';
				}
				const opacity = parseFloat(element.style.opacity);
				if (opacity > 0) {
					element.style.opacity = `${opacity - 0.05}`;
				} else {
					resolve();
					clearInterval(fadeEffect);
				}
			}, 20);
		});
	}
}
