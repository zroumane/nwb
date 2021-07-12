import "../css/CreateBuild.scss";
import "bootstrap/js/dist/tab";
import Popover from "bootstrap/js/dist/popover";
import { $q, $qa, MAX_COL, MAX_ROW, lang } from "./Global";
import { getMethod, getBuildId, setBrightness } from "./Utils";

const $weaponSelects = $qa(".weaponSelect");
const $weaponSidebars = $qa(".weaponSidebar");
const $skillSections = $qa(".skillSection");
const $loadingSpinners = [$qa(".spinner1"), $qa(".spinner2")];
const $branchNames = [$qa(".branchName1"), $qa(".branchName2")];
const $skillContainers = [$qa(".skill-container1"), $qa(".skill-container2")];
const $svgContainers = [$qa(".svgContainer1"), $qa(".svgContainer2")];
const $progressBars = $qa(".progress-bar");
const $pointProgresText = $qa(".pointProgresText");
const $mainSkills = $qa(".mainSkill");
const $mainSkillDeletes = $qa(".mainSkillDelete");

window.currentWeapons = [undefined, undefined];

//TODO : construire cet object pour le body du POST
// window.build = {
//   name: "",
//   description: "",
//   type: 0,
//   weapons: [],
//   activeSkills: [[], []],
//   mainSkills: [
//     [null, null, null],
//     [null, null, null],
//   ],
// };

const getSkills = async (weapon) => (weapon.skills = (await getMethod(`/api/weapons/${weapon.id}/skills`))["hydra:member"]);

const setCountdown = (weaponIndex) => {
  let n = window.currentWeapons[weaponIndex].countdown[0];
  $progressBars[weaponIndex].style.width = (n * 100) / 19 + "%";
  $pointProgresText[weaponIndex].innerText = window.messageLocal["RemainingPoint"] + n;
};

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
  let buildId = getBuildId();
  if (buildId) {
    let build = await getMethod(`/api/build/${buildId}`);
    // TODO : fill build name, description, type
    // build.name;
    // build.description;
    // build.type;

    window.build.mainSkills = build.mainSkills;

    build.weapons.forEach(async (weaponIRI, weaponIndex) => {
      let weapon = window.weapons.filter((w) => w["@id"] == weaponIRI)[0];
      $weaponSelects[weaponIndex].value = weapon.id;
      await getSkills(weapon);
      build.activeSkills[weaponIndex].forEach((skill) => {
        weapon.skills.filter((s) => (s.id = skill.id))[0].active = true;
        weapon.countdown[0]--;
        weapon.countdown[skill.side]++;
      });
      weapon.mainSkills = build.activeSkills[weaponIndex];
      changeWeapon(weaponIndex, weapon.id);
    });
  }
};

main();

const changeWeapon = async (weaponIndex, weaponId) => {
  $weaponSidebars[weaponIndex].classList.add("d-none");
  $skillSections[weaponIndex].classList.add("d-none");
  $loadingSpinners[weaponIndex].forEach((el) => el.classList.remove("d-none"));
  window.currentWeapons[weaponIndex] = window.weapons.filter((w) => w.id == weaponId)[0];
  let weapon = window.currentWeapons[weaponIndex];
  let $diffWeaponSelectOptions = Array.from($weaponSelects[weaponIndex == 0 ? 1 : 0].options);
  $diffWeaponSelectOptions.forEach((el) => el.classList.remove("d-none"));
  $diffWeaponSelectOptions.filter((el) => el.value == weaponId)[0].classList.add("d-none");
  $branchNames[weaponIndex].forEach((el, i) => (el.innerText = window.weaponLocal[weapon.branch[i]]));
  if (!weapon.skills) await getSkills(weapon, weapon.id);
  if (!weapon.mainSkills) weapon.mainSkills = [null, null, null];
  if (!weapon.countdown) weapon.countdown = [19, 0, 0];
  setCountdown(weaponIndex);
  $svgContainers[weaponIndex].forEach((el) => (el.firstElementChild.innerHTML = ""));
  for (let c = 1; c <= 3; c++) {
    let $mainSkills = $qa(`#mainSkill-${weaponIndex + 1}-${c}`);
    $mainSkills.forEach(($mainSkill) => {
      $mainSkill.dataset.id = 0;
      $mainSkill.src = "/img/emptyCadre.png";
      $mainSkill.parentElement.classList.add("d-none");
    });
    let $mainSkillSelected = $q(`#mainSkillSelected-${weaponIndex + 1}-${c}`);
    $mainSkillSelected.dataset.id = 0;
    $mainSkillSelected.src = "/img/emptyCadre.png";
  }
  let mainSkillCount = 1;
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
      setBrightness($skillContainer, match);
      if (match.parent) {
        let parentMatch = weapon.skills.filter((s) => s["@id"] == match.parent)[0];
        if (parentMatch) {
          let bgSVG = $svgContainers[weaponIndex][match.side - 1].firstElementChild;
          bgSVG.innerHTML += `<line class="skillLine" 
            x1="${(parentMatch.col * 100) / MAX_COL - 10}%" y1="${(parentMatch.line * 100) / MAX_ROW - 10}%" 
            x2="${(match.col * 100) / MAX_COL - 10}%" y2="${(match.line * 100) / MAX_ROW - 10}%"/>`;
        }
      }
      if (match.type == 1) {
        let $mainSkills = $qa(`.mainSkill[data-li="${mainSkillCount}"]`);
        $mainSkills.forEach(($mainSkill, index) => {
          $mainSkill.src = `/img/nwpng/${match.skillKey}.png`;
          $mainSkill.dataset.id = match.id;
          if (match.active) {
            $mainSkill.parentElement.classList.remove("d-none");
            if (weapon.mainSkills[index] == match["@id"]) {
              $mainSkills.forEach((el) => el.parentElement.classList.add("d-none"));
              let $mainSkillSelected = $q(`#mainSkillSelected-${weaponIndex + 1}-${index + 1}`);
              $mainSkillSelected.src = $mainSkill.src;
              $mainSkillSelected.dataset.id = $mainSkill.dataset.id;
            }
          } else $mainSkill.parentElement.classList.add("d-none");
        });
        mainSkillCount++;
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
    if (window.currentWeapons[weaponIndex]?.id == $selectedOption.value) return;
    changeWeapon(weaponIndex, $selectedOption.value);
  });
});

$skillContainers.forEach(($skillContainers, weaponIndex) => {
  $skillContainers.forEach(($skillContainer) => {
    $skillContainer.addEventListener("click", () => {
      let weapon = window.currentWeapons[weaponIndex];
      let skillId = $skillContainer.dataset.id;
      if (skillId == 0) return;
      let skill = window.currentWeapons[weaponIndex].skills.filter((s) => s.id == skillId)[0];
      if (!skill) return;

      //Conditions pour allumer le skill
      if (!skill.active) {
        // 1. Si tous les point utiliser
        if (weapon.countdown[0] == 0) {
          alert("plus de point");
          return;
        }

        // 2. Si skill enfant, si skill parent inactive
        if (skill.parent) {
          let parent = weapon.skills.filter((s) => s["@id"] == skill.parent)[0];
          if (!parent.active) {
            alert("skill parent inactive");
            return;
          }
        }
        // 3. Si pas la première ligne, si aucun skill ligne précédente active
        if (skill.line != 1 && weapon.skills.filter((s) => s.side == skill.side && s.line == skill.line - 1 && s.active).length == 0) {
          alert("pas de skill ligne précédente active");
          return;
        }

        // 4. Si ultimate, si pas 10 point attribué sur le side
        if (skill.line == 6) {
          if (weapon.countdown[skill.side] < 10) {
            alert("pas 10 selectionner dans le side");
            return;
          }
        }

        skill.active = true;
        setBrightness($skillContainer, skill);
        weapon.countdown[0]--;
        weapon.countdown[skill.side]++;
        if (skill.type == 1) {
          $qa(`.mainSkill[data-id="${skill.id}"]`).forEach(($mainSkill, index) => {
            $mainSkill.parentElement.classList.remove("d-none");
          });
        }
      }

      //Conditions pour eteindre le skill
      else {
        // 1. Si skill parent, si skill enfant active
        if (skill.children.length > 0) {
          if (skill.children.filter((c) => weapon.skills.filter((s) => s["@id"] == c && s.active)[0]).length > 0) {
            alert("skill enfant active");
            return;
          }
        }

        // 2. Si skills ligne suivante active et pas de skill meme ligne active -> refuse
        if (skill.line != 6 && weapon.skills.filter((s) => s.side == skill.side && s.line == skill.line + 1 && s.active).length > 0) {
          if (weapon.skills.filter((s) => s.line == skill.line && s.active).length > 0) {
            alert("skill ligne suivante active");
            return;
          }
        }

        // 3. Si point dépenser dans la branche = 11, si skill derniere ligne active
        if (weapon.countdown[skill.side] == 11 && weapon.skills.filter((s) => s.side == skill.side && s.line == 6 && s.active).length > 0) {
          alert("skill derniere ligne selectionner mais point == 11");
          return;
        }

        skill.active = false;
        setBrightness($skillContainer, skill);
        weapon.countdown[0]++;
        weapon.countdown[skill.side]--;
        if (skill.type == 1) {
          $qa(`.mainSkill[data-id="${skill.id}"]`).forEach(($mainSkill, index) => {
            $mainSkill.parentElement.classList.add("d-none");
            let $mainSkillSelected = $q(`#mainSkillSelected-${weaponIndex + 1}-${index + 1}`);
            if ($mainSkillSelected.dataset.id == skill.id) {
              $mainSkillSelected.dataset.id = 0;
              $mainSkillSelected.src = "/img/emptyCadre.png";
              weapon.mainSkills[index] = null;
            }
          });
        }
      }

      setCountdown(weaponIndex);
    });
  });
});

$mainSkills.forEach(($mainSkill) => {
  $mainSkill.addEventListener("click", () => {
    let data = $mainSkill.id.split("-");
    let weaponIndex = data[1] - 1;
    let cadre = data[2];
    let skillId = $mainSkill.dataset.id;
    let $mainSkillSelected = $q(`#mainSkillSelected-${weaponIndex + 1}-${cadre}`);
    $qa(`.mainSkill[data-id="${$mainSkillSelected.dataset.id}"]`).forEach((el) => el.classList.remove("d-none"));
    $qa(`.mainSkill[data-id="${skillId}"]`).forEach((el) => el.classList.add("d-none"));
    $mainSkillSelected.dataset.id = skillId;
    $mainSkillSelected.src = $mainSkill.src;
    window.currentWeapons[weaponIndex].mainSkills[cadre - 1] = "/api/skills/" + skillId;
  });
});

$mainSkillDeletes.forEach(($mainSkillDelete) => {
  $mainSkillDelete.addEventListener("click", (e) => {
    let data = $mainSkillDelete.id.split("-");
    let weaponIndex = data[1] - 1;
    let cadre = data[2];
    let $mainSkillSelected = $q(`#mainSkillSelected-${weaponIndex + 1}-${cadre}`);
    let skillId = $mainSkillSelected.dataset.id;
    $qa(`.mainSkill[data-id="${skillId}"]`).forEach((el) => el.classList.remove("d-none"));
    $mainSkillSelected.dataset.id = 0;
    $mainSkillSelected.src = "/img/emptyCadre.png";
    window.currentWeapons[weaponIndex].mainSkills[cadre - 1] = null;
  });
});
