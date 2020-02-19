export class CoreSleep {
	static sleep(time: number): Promise<void> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, time);
		});
	}
}
