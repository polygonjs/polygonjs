let _userHasInteractedWithPage = false;
export async function waitForUserInteraction(): Promise<void> {
	if (_userHasInteractedWithPage) {
		return;
	}
	return new Promise((resolve) => {
		const buttonElement = document.createElement('div');
		buttonElement.innerText = 'CLICK TO START TEST';
		buttonElement.onclick = () => {
			document.body.removeChild(buttonElement);
			_userHasInteractedWithPage = true;
			resolve();
		};

		document.body.prepend(buttonElement);
		buttonElement.style.position = 'absolute';
		buttonElement.style.top = '50%';
		buttonElement.style.left = '50%';
		buttonElement.style.transform = 'translate(-50%,-50%)';
		buttonElement.style.backgroundColor = 'red';
		buttonElement.style.color = 'white';
		buttonElement.style.cursor = 'pointer';
		buttonElement.style.padding = '20px';
		buttonElement.style.fontSize = '3rem';
		buttonElement.style.whiteSpace = 'nowrap';
	});
}
