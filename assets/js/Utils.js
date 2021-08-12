import Popover from "bootstrap/js/dist/popover";

/**
 * @param {string} url
 * @returns []
 */
const getMethod = async (url) => {
  var data = await fetch(url, {
    cache: "no-store",
  });
  return await data.json();
};

const getBuildId = () => {
  let $buildId = document.querySelector("#buildId");
  return $buildId ? $buildId.value : null;
};

const setBrightness = ($skillContainer, skill) => {
  $skillContainer.style.filter = `brightness(${skill.selected ? 1 : 0.4})`;
};

const initCarCapsPopover = ($carCaps) => {
  $carCaps.forEach(($caps) => {
    $caps.forEach(($car, i) => {
      let key = `${$car.dataset.carkey}_Bonus_${(i + 1) * 50}_active`;
      new Popover($car, {
        content: window.skillLocal[key] ?? key,
        trigger: "hover",
        placement: "top",
        html: true,
      });
    });
  });
};

export { getMethod, getBuildId, setBrightness, initCarCapsPopover };
