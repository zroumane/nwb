/**
 * @param {string} url
 * @returns []
 */
const getMethod = async (url) => {
  var data = await fetch(url);
  return await data.json();
};

const getBuildId = () => {
  let last = parseInt(window.location.href.split("/").reverse()[0]);
  return !isNaN(last) ? last : null;
};

const setBrightness = ($skillContainer, skill) => {
  $skillContainer.style.filter = `brightness(${skill.active ? 1 : 0.4})`;
};

export { getMethod, getBuildId, setBrightness };
