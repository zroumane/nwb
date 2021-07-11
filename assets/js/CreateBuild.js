import "../css/CreateBuild.scss";
import "bootstrap/js/dist/tab";
import { $q, $qa, MAX_COL, MAX_ROW, lang } from "./Global";
import { getMethod } from "./utils/getMethod";

const $weaponSelects = $qa(".weaponSelect");
const $weaponSidebars = $qa(".weaponSidebar");
const $skillSections = $qa(".skillSection");
const $loadingSpinners = [$qa(".spinner1"), $qa(".spinner2")];
const $branchNames = [$qa(".branchName1"), $qa(".branchName2")];
const $skillContainers = [$qa(".skill-container1"), $qa(".skill-container2")];
const $svgContainers = [$qa(".svgContainer1"), $qa(".svgContainer2")];
const $progressBars = $qa(".progress-bar");
const $pointProgresText = $qa(".pointProgresText");

window.currentWeapon = [undefined, undefined];

const main = async () => {
  window.weaponLocal = await getMethod(`json/${lang}/weapon.json`);
  window.messageLocal = await getMethod(`json/${lang}/messageSkill.json`);
  let data = await getMethod("/api/weapons");
  window.weapons = data["hydra:member"];
  window.weapons.forEach((weapon) => {
    let $weaponOption = document.createElement("option");
    $weaponOption.innerText = window.weaponLocal[weapon.weaponKey];
    $weaponOption.value = weapon.id;
    $weaponSelects.forEach((el) => el.appendChild($weaponOption.cloneNode(true)));
  });
};

main();

$weaponSelects.forEach(($weaponSelect, index) => {
  $weaponSelect.addEventListener("change", async () => {
    const $selectedOption = $weaponSelect.options[$weaponSelect.selectedIndex];
    if (window.currentWeapon[index]?.id == $selectedOption.value) return;
    $weaponSidebars[index].classList.add("d-none");
    $skillSections[index].classList.add("d-none");
    $loadingSpinners[index].forEach((el) => el.classList.remove("d-none"));
    window.currentWeapon[index] = window.weapons.filter((w) => w.id == $selectedOption.value)[0];
    let weapon = window.currentWeapon[index];
    let $diffWeaponSelectOptions = Array.from($weaponSelects[index == 0 ? 1 : 0].options);
    $diffWeaponSelectOptions.forEach((el) => el.classList.remove("d-none"));
    $diffWeaponSelectOptions.filter((el) => el.value == $selectedOption.value)[0].classList.add("d-none");
    $branchNames[index].forEach((el, i) => (el.innerText = window.weaponLocal[weapon.branch[i]]));
    if (!weapon.skills) weapon.skills = (await getMethod(`/api/weapons/${weapon.id}/skills`))["hydra:member"];
    if (!weapon.countdown) weapon.countdown = [19, 0, 0];
    $pointProgresText[index].innerText = window.messageLocal["RemainingPoint"] + weapon.countdown[0];
    console.log($progressBars[index]);
    $progressBars[index].style.width = (weapon.countdown[0] * 100) / 19 + "%";
    $svgContainers[index].forEach((el) => (el.firstElementChild.innerHTML = ""));
    $skillContainers[index].forEach(($skillContainer) => {
      $skillContainer.style.filter = `brightness(1)`;
      let data = $skillContainer.id.split("-");
      let match = weapon.skills.filter((s) => s.side == data[2] && s.line == data[3] && s.col == data[4])[0];
      $skillContainer.style.backgroundImage = match ? `url('/img/bg/bg${match.bgColor}${match.type == 1 ? "" : "c"}.png')` : "";
      $skillContainer.style.backgroundSize = match ? ([1, 3].includes(match.type) ? "90% 90%" : "70% 70%") : "";
      $skillContainer.firstElementChild.style.backgroundImage = match ? `url(/img/nwpng/${match.skillKey}.png)` : "";
      $skillContainer.firstElementChild.style.backgroundSize = match ? ([1, 3].includes(match.type) ? "90% 90%" : "70% 70%") : "";
      $skillContainer.dataset.id = match ? match.id : 0;
      if (match) {
        if (match.active == undefined) match.active = false;
        $skillContainer.style.filter = `brightness(${match.active ? 1 : 0.4})`;
        if (match.parent != undefined) {
          let parentMatch = weapon.skills.filter((s) => s["@id"] == match.parent)[0];
          if (parentMatch) {
            let bgSVG = $svgContainers[index][match.side - 1].firstElementChild;
            bgSVG.innerHTML += `<line class="skillLine" 
              x1="${(parentMatch.col * 100) / MAX_COL - 10}%" y1="${(parentMatch.line * 100) / MAX_ROW - 10}%" 
              x2="${(match.col * 100) / MAX_COL - 10}%" y2="${(match.line * 100) / MAX_ROW - 10}%"/>`;
          }
        }
      }
    });
    $loadingSpinners[index].forEach((el) => el.classList.add("d-none"));
    $weaponSidebars[index].classList.remove("d-none");
    $skillSections[index].classList.remove("d-none");
  });
});
