const button = document.querySelector('.theme');
const sun = document.querySelector('.theme > img.sun');
const moon = document.querySelector('.theme > img.moon');

if (!button || !sun || !moon) {
	throw new Error('Theme switcher, or sun/moon button not found');
};

button.addEventListener('click', () => {
	document.body.classList.toggle('dark');
	sun.classList.toggle('hidden');
	moon.classList.toggle('hidden');
});
