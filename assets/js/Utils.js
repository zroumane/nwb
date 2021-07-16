/**
 * @param {string} url
 * @returns []
 */
const getMethod = async (url) => {
  var data = await fetch(url);
  return await data.json();
};

const getBuildId = () => {
  let $buildId = document.querySelector("#buildId");
  return $buildId ? $buildId.value : null;
};

const setBrightness = ($skillContainer, skill) => {
  $skillContainer.style.filter = `brightness(${skill.selected ? 1 : 0.4})`;
};

export { getMethod, getBuildId, setBrightness };
