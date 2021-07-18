import "../css/Builds.scss";
import { $q } from "./Global";

const $filterBuildForm = $q("#filterBuildForm");
const $filterBuildReset = $q("#filterBuildReset");
// const $filterBuildSearch = $q("#filterBuildSearch");
const $filterBuildWeapon = $q("#filterBuildWeapon");
const $allWeaponCheck = $q("#allWeaponCheck").querySelector("input");
const $weaponsChecks = $filterBuildWeapon.querySelectorAll("input[data-id]");
const $filterBuildType = $q("#filterBuildType");

const $allWeaponText = $q("#allWeaponText");
const allWeaponText = $allWeaponText.innerText;
const weaponLabelText = $q("#weaponLabel").innerText;

let url = new URL(window.location.href);

/**
 * Refresh with filter
 */
const sendForm = () => {
  // $filterBuildSearch.value != "" ? url.searchParams.set("s", $filterBuildSearch.value) : url.searchParams.delete("s");
  $filterBuildType.value != 0 ? url.searchParams.set("t", $filterBuildType.value) : url.searchParams.delete("t");
  let weaponCheck = Array.from($weaponsChecks)
    .filter(($w) => $w.checked)
    .map(($w) => $w.dataset.id);
  weaponCheck.length ? url.searchParams.set("w", weaponCheck.join(",")) : url.searchParams.delete("w");
  url.searchParams.delete("page");
  window.location.href = url.href;
};

/**
 * Update weapons label
 */
const updateWeapon = () => {
  let count = 0;
  $weaponsChecks.forEach(($w) => {
    if ($w.checked) count++;
  });
  if (count == $weaponsChecks.length || count == 0) {
    $weaponsChecks.forEach(($w) => {
      $w.checked = false;
    });
    $allWeaponCheck.checked = true;
    $allWeaponCheck.disabled = true;
    $allWeaponText.innerText = allWeaponText;
  } else {
    $allWeaponCheck.checked = false;
    $allWeaponCheck.disabled = false;
    $allWeaponText.innerText = `${count} ${weaponLabelText}`;
  }
};

/**
 * Set filter input at startup
 */
const main = () => {
  // $filterBuildSearch.value = url.searchParams.get("s");
  $filterBuildType.value = url.searchParams.get("t") ?? "0";

  if (url.searchParams.get("w")) {
    let weapon = url.searchParams.get("w").split(",");

    $weaponsChecks.forEach(($w) => {
      if (weapon.includes($w.dataset.id)) {
        $w.checked = true;
        $allWeaponCheck.checked = false;
        $allWeaponCheck.disabled = false;
      }
    });
    updateWeapon();
  }
};
main();

/**
 * Add a weapon
 */
$weaponsChecks.forEach(($w) => {
  $w.addEventListener("change", () => {
    if ($w.checked) {
      $allWeaponCheck.checked = false;
      $allWeaponCheck.disabled = false;
    }
    updateWeapon();
  });
});

/**
 * All weapon
 */
$allWeaponCheck.addEventListener("change", () => {
  if ($allWeaponCheck.checked) {
    $weaponsChecks.forEach(($w) => {
      $w.checked = false;
    });
    $allWeaponCheck.disabled = true;
    updateWeapon();
  }
});

/**
 * Filtering
 */
$filterBuildForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendForm();
});

/**
 * Reseting
 */
$filterBuildReset.addEventListener("click", () => {
  url.search = "";
  window.location.href = url.href;
});
