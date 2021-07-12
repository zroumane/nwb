import "../css/CreateBuild.scss";
import "bootstrap/js/dist/tab";
import { $q, $qa, MAX_COL, MAX_ROW, lang } from "./Global";
import { getMethod, getBuildId } from "./Utils";

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
  window.build = {
    name: "",
    description: "",
    type: 0,
    weapons: [],
    activeSkills: [[], []],
    mainSkills: [[], []],
  };
  let buildId = getBuildId();
  if (buildId) {
    let build = await getMethod(`/api/build/${buildId}`);
    window.build.name = build.name;
    window.build.description = build.description;
    window.build.type = build.type;
    window.build.weapons = build.weapons;
    window.build.activeSkills = build.activeSkills;
    window.build.mainSkills = build.mainSkills;
    window.build.weapons
      .map((w) => w.split("/").reverse()[0])
      .forEach(async (weaponId, weaponIndex) => {
        $weaponSelects[weaponIndex].value = weaponId;
        await getSkills(window.weapon[weaponIndex]);
      });
    window.build.activeSkills.forEach((skills, weaponIndex) => {
      let weapon = window.weapons.filter((w) => w["@id"] == window.build.weapons[weaponIndex])[0];
      skills.forEach((skill) => {
        weapon.skill.filter((s) => (s.id = skill.id))[0].active = true;
      });
    });
    // TODO : fill build name, description, type, mainSkills
    changeWeapon(weaponIndex, weaponId);
  }
};

main();

const getSkills = async (weapon) => (weapon.skills = (await getMethod(`/api/weapons/${weapon.id}/skills`))["hydra:member"]);

const changeWeapon = async (weaponIndex, weaponId) => {
  $weaponSidebars[weaponIndex].classList.add("d-none");
  $skillSections[weaponIndex].classList.add("d-none");
  $loadingSpinners[weaponIndex].forEach((el) => el.classList.remove("d-none"));
  window.currentWeapon[weaponIndex] = window.weapons.filter((w) => w.id == weaponId)[0];
  let weapon = window.currentWeapon[weaponIndex];
  let $diffWeaponSelectOptions = Array.from($weaponSelects[weaponIndex == 0 ? 1 : 0].options);
  $diffWeaponSelectOptions.forEach((el) => el.classList.remove("d-none"));
  $diffWeaponSelectOptions.filter((el) => el.value == weaponId)[0].classList.add("d-none");
  $branchNames[weaponIndex].forEach((el, i) => (el.innerText = window.weaponLocal[weapon.branch[i]]));
  if (!weapon.skills) await getSkills(weapon, weapon.id);
  if (!weapon.countdown) weapon.countdown = [19, 0, 0];
  $pointProgresText[weaponIndex].innerText = window.messageLocal["RemainingPoint"] + weapon.countdown[0];
  console.log($progressBars[weaponIndex]);
  $progressBars[weaponIndex].style.width = (weapon.countdown[0] * 100) / 19 + "%";
  $svgContainers[weaponIndex].forEach((el) => (el.firstElementChild.innerHTML = ""));
  $skillContainers[weaponIndex].forEach(($skillContainer) => {
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
          let bgSVG = $svgContainers[weaponIndex][match.side - 1].firstElementChild;
          bgSVG.innerHTML += `<line class="skillLine" 
            x1="${(parentMatch.col * 100) / MAX_COL - 10}%" y1="${(parentMatch.line * 100) / MAX_ROW - 10}%" 
            x2="${(match.col * 100) / MAX_COL - 10}%" y2="${(match.line * 100) / MAX_ROW - 10}%"/>`;
        }
      }
    }
  });
  $loadingSpinners[weaponIndex].forEach((el) => el.classList.add("d-none"));
  $weaponSidebars[weaponIndex].classList.remove("d-none");
  $skillSections[weaponIndex].classList.remove("d-none");
};

$weaponSelects.forEach(($weaponSelect, weaponIndex) => {
  $weaponSelect.addEventListener("change", () => {
    const $selectedOption = $weaponSelect.options[$weaponSelect.selectedIndex];
    if (window.currentWeapon[weaponIndex]?.id == $selectedOption.value) return;
    changeWeapon(weaponIndex, $selectedOption.value);
  });
});
