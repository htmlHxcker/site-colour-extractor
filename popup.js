document.getElementById('extractColors').addEventListener('click', async () => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript(
		{
			target: { tabId: tab.id },
			function: extractColors,
		},
		displayColors
	);
});

function extractColors() {
	const elements = document.querySelectorAll('*');
	const colors = new Set();

	elements.forEach((element) => {
		const styles = window.getComputedStyle(element);
		colors.add(styles.backgroundColor);
		colors.add(styles.color);
		colors.add(styles.borderColor);
	});

	return Array.from(colors)
		.filter((color) => color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)')
		.slice(0, 10);
}

function displayColors(results) {
	const palette = document.getElementById('colorPalette');
	palette.innerHTML = '';

	const colors = results[0].result;
	colors.forEach((color) => {
		const colorBox = document.createElement('div');
		colorBox.className = 'color-box';
		colorBox.style.backgroundColor = color;

		const hexValue = document.createElement('div');
		hexValue.className = 'color-hex';
		hexValue.textContent = color;

		colorBox.appendChild(hexValue);
		palette.appendChild(colorBox);
	});
}
