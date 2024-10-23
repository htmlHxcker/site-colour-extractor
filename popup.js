async function initialize() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript(
		{
			target: { tabId: tab.id },
			function: extractColors,
		},
		(results) => {
			if (results && results[0] && results[0].result) {
				chrome.storage.local.set({ colorData: results[0].result });
				displayColors(results);
			}
		}
	);
}

function extractColors() {
	const elements = document.querySelectorAll('*');
	const colorMap = new Map();

	elements.forEach((element) => {
		const styles = window.getComputedStyle(element);
		updateColorCount(colorMap, styles.backgroundColor, 'background');
		updateColorCount(colorMap, styles.color, 'text');
	});

	return Array.from(colorMap.entries())
		.filter(
			([color]) => color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)'
		)
		.sort((a, b) => b[1].count - a[1].count);
}

function updateColorCount(map, color, type) {
	if (!map.has(color)) {
		map.set(color, { count: 0, types: new Set() });
	}
	const data = map.get(color);
	data.count++;
	data.types.add(type);
}

function displayColors(results) {
	const palette = document.getElementById('colorPalette');
	palette.innerHTML = '';

	if (!results || !results[0] || !results[0].result) {
		return;
	}

	const colors = results[0].result.slice(0, 5);
	colors.forEach(([color, data]) => {
		const colorBar = document.createElement('div');
		colorBar.className = 'color-bar';
		colorBar.style.backgroundColor = color;

		const hexValue = document.createElement('div');
		hexValue.className = 'color-hex';
		hexValue.textContent = rgbToHex(color);

		colorBar.appendChild(hexValue);
		palette.appendChild(colorBar);
	});
}

document.getElementById('showDetailedReport').addEventListener('click', () => {
	chrome.tabs.create({ url: 'report.html' });
});

function rgbToHex(rgb) {
	// Convert RGB to Hex implementation
	return rgb; // Placeholder
}

// Initialize on popup load
document.addEventListener('DOMContentLoaded', initialize);
