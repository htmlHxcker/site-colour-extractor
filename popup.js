async function initialize() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	'Current tab:', tab;

	chrome.scripting
		.executeScript({
			target: { tabId: tab.id },
			func: extractColors,
			world: 'MAIN',
		})
		.then((results) => {
			'Extraction results:', results;
			if (results && results[0] && results[0].result) {
				'Original color data with Sets:', results[0].result;

				const colorDataForStorage = results[0].result.map(([color, data]) => [
					color,
					{
						count: data.count,
						types: Array.from(data.types),
					},
				]);
				'Converted color data for storage:', colorDataForStorage;

				chrome.storage.local.set({ colorData: colorDataForStorage });
				displayColors(results);
			}
		});
}

function extractColors() {
	('Starting color extraction');
	const elements = document.querySelectorAll('*');
	'Found elements:', elements.length;

	const colorMap = new Map();

	function updateColorCount(map, color, type) {
		if (!map.has(color)) {
			map.set(color, { count: 0, types: new Set() });
		}
		const data = map.get(color);
		data.count++;
		data.types.add(type);
	}

	elements.forEach((element) => {
		const styles = window.getComputedStyle(element);
		const bgColor = styles.backgroundColor;
		const textColor = styles.color;

		if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
			updateColorCount(colorMap, bgColor, 'background');
		}
		if (textColor !== 'transparent' && textColor !== 'rgba(0, 0, 0, 0)') {
			updateColorCount(colorMap, textColor, 'text');
		}
	});

	// Convert Sets to Arrays before returning
	const serializable = Array.from(colorMap.entries()).map(([color, data]) => [
		color,
		{
			count: data.count,
			types: Array.from(data.types),
		},
	]);

	const sortedColors = serializable.sort((a, b) => b[1].count - a[1].count);
	'Sorted colors:', sortedColors;
	return sortedColors;
}
function displayColors(results) {
	const palette = document.getElementById('colorPalette');
	palette.innerHTML = '';

	if (!results || !results[0] || !results[0].result) {
		return;
	}

	const colors = results[0].result.slice(0, 5); // Only take top 5 colors
	colors.forEach(([color, data]) => {
		const colorBar = document.createElement('div');
		colorBar.className = 'color-bar';
		colorBar.style.backgroundColor = color;

		const hexValue = document.createElement('div');
		hexValue.className = 'color-hex';
		// Set text color to black for light colors
		hexValue.style.color = isLightColor(color) ? 'black' : 'white';
		hexValue.textContent = rgbToHex(color);

		colorBar.appendChild(hexValue);
		palette.appendChild(colorBar);
	});
}

document.getElementById('showDetailedReport').addEventListener('click', () => {
	chrome.tabs.create({ url: 'report.html' });
});

// Initialize on popup load
document.addEventListener('DOMContentLoaded', initialize);
