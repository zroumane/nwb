/**
 * @param {string} url
 * @returns []
 */
const getMethod = async (url) => {
  var data = await fetch(url);
  return await data.json();
};

export { getMethod };
