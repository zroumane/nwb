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

export { getMethod, getBuildId };
