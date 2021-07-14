import "../css/CreateBuild.scss";
import "bootstrap/js/dist/tab";
import Popover from "bootstrap/js/dist/popover";
import { $q, $qa, MAX_COL, MAX_ROW, lang } from "./Global";
import { getMethod, getBuildId, setBrightness } from "./Utils";

const $formBuildName = $q("#formBuildName");
const $formBuildNameInvalid = $q("#formBuildNameInvalid");
const $formBuildType = $q("#formBuildType");
const $formBuildDesc = $q("#formBuildDesc");

const $weaponTabs = $qa(".weaponTab");
const $weaponSelects = $qa(".weaponSelect");
const $weaponSidebars = $qa(".weaponSidebar");
const $skillSections = $qa(".skillSection");
const $loadingSpinners = [$qa(".spinner1"), $qa(".spinner2")];

const $progressBars = $qa(".progress-bar");
const $pointProgresText = $qa(".pointProgresText");

const $mainSkills = $qa(".mainSkill");
const $mainSkillLists = [$qa(".mainskillList1"), $qa(".mainskillList2")];
const $mainSkillSelecteds = [$qa(".mainSkillSelected1"), $qa(".mainSkillSelected2")];
const $mainSkillDeletes = $qa(".mainSkillDelete");

const $weaponResetButtons = $qa(".resetButton");
const $branchNames = [$qa(".branchName1"), $qa(".branchName2")];
const $skillContainers = [$qa(".skill-container1"), $qa(".skill-container2")];
const $svgContainers = [$qa(".svgContainer1"), $qa(".svgContainer2")];

const $formBuildSave = $q("#formBuildSave");
const $formBuildSaveLoader = $q("#formBuildSaveLoader");

window.currentWeapons = [null, null];
/**
 * Associe les skills à "weapon" aprçès un fetch de l'api
 * @param {number} weapon
 */
const getSkills = async (weapon) => (weapon.skills = (await getMethod(`/api/weapons/${weapon.id}/skills`))["hydra:member"]);

/**
 * Met a jour le coutdown progress en fonction des points restants
 * @param {index} weaponIndex
 */
const setCountdown = (weaponIndex) => {
  let n = window.currentWeapons[weaponIndex].countdown[0];
  $progressBars[weaponIndex].style.width = (n * 100) / 19 + "%";
  $pointProgresText[weaponIndex].innerText = window.messageLocal["RemainingPoint"] + n;
};

/**
 * Change skill popover
 * @param {HTMLElement} $skillContainer
 * @param {string} title
 * @param {string} description
 */
const changePopover = ($el, title, description) => {
  $el.setAttribute("data-bs-original-title", title);
  $el.setAttribute("data-bs-content", description);
  Pop($el).show();
};

/**
 * @param {HTMLElement} $el
 * @returns Popover instance
 */
const Pop = ($el) => Popover.getInstance($el);

/**
 * Main : Permet de fetch les json, les weapons
 * et si "/edit", les infos de la build en question
 */
const main = async () => {
  window.weaponLocal = await getMethod(`/json/${lang}/weapon.json`);
  window.messageLocal = await getMethod(`/json/${lang}/message.json`);
  window.skillLocal = await getMethod(`/json/${lang}/skill.json`);
  $formBuildNameInvalid.innerText = window.messageLocal["TitleLenght"];
  let data = await getMethod("/api/weapons");
  window.weapons = data["hydra:member"];
  window.weapons.forEach((weapon) => {
    if (weapon.id == 1) return;
    let $weaponOption = document.createElement("option");
    $weaponOption.innerText = window.weaponLocal[weapon.weaponKey];
    $weaponOption.value = weapon.id;
    $weaponSelects.forEach((el) => el.appendChild($weaponOption.cloneNode(true)));
  });
  window.buildId = getBuildId();
  if (window.buildId) {
    let build = await getMethod(`/api/builds/${window.buildId}`);
    $formBuildName.value = build.name;
    $formBuildDesc.value = build.description;
    $formBuildType.value = build.type;
    build.weapons.forEach(async (weaponIRI, weaponIndex) => {
      $loadingSpinners[weaponIndex].forEach((el) => el.classList.remove("d-none"));
      let weapon = window.weapons.filter((w) => w["@id"] == weaponIRI)[0];
      $weaponSelects[weaponIndex].value = weapon.id;
      await getSkills(weapon);
      weapon.countdown = [19, 0, 0];
      build.activeSkills[weaponIndex].forEach((skill) => {
        weapon.skills.filter((s) => s["@id"] == skill)[0].active = true;
        weapon.countdown[0]--;
        weapon.countdown[skill.side]++;
      });
      weapon.mainSkills = build.mainSkills[weaponIndex];
      $weaponSelects[weaponIndex].value = weapon.id;
      await changeWeapon(weaponIndex, weapon.id);
    });
  }
  formBuildSave.classList.remove("d-none");
};

main();

/**
 * Mise en place d'une arme (weaponId) dans l'onglet correspondant (weaponIndex)
 * Fetch les skills si ce n'est pas déja fait. Mise en forme des skills, mainSkills
 * coutdown en fonction de la séléction de l'utilisation
 * @param {number} weaponIndex
 * @param {number} weaponId
 */
const changeWeapon = async (weaponIndex, weaponId) => {
  $weaponSidebars[weaponIndex].classList.add("d-none");
  $skillSections[weaponIndex].classList.add("d-none");
  $loadingSpinners[weaponIndex].forEach((el) => el.classList.remove("d-none"));
  if (weaponId == 0) {
    window.currentWeapons[weaponIndex] = null;
    $loadingSpinners[weaponIndex].forEach((el) => el.classList.add("d-none"));
    return;
  }
  $weaponTabs.forEach((el) => el.classList.remove("text-danger"));
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
  $skillContainers[weaponIndex].forEach((el) => Pop(el).disable());
  $svgContainers[weaponIndex].forEach((el) => (el.firstElementChild.innerHTML = ""));
  for (let c = 1; c <= 3; c++) {
    let $mainSkills = $mainSkillLists[weaponIndex][c - 1].children;
    $mainSkills.forEach(($mainSkill) => {
      $mainSkill.firstElementChild.dataset.id = 0;
      $mainSkill.firstElementChild.src = "/img/emptyCadre.png";
      $mainSkill.classList.add("d-none");
    });
    let $mainSkillSelected = $mainSkillSelecteds[weaponIndex][c - 1];
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
    changePopover($skillContainer, match ? match.skillKey : "", match ? match.skillKey : "");
    if (match) {
      Pop($skillContainer).enable();
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
        let isSelected = false;
        let $mainSkills = [];
        $mainSkillLists[weaponIndex].forEach((ul) => $mainSkills.push(ul.querySelector(`img[data-li="${mainSkillCount}"]`)));
        $mainSkills.forEach(($mainSkill, index) => {
          $mainSkill.src = `/img/nwpng/${match.skillKey}.png`;
          $mainSkill.dataset.id = match.id;
          if (match.active) {
            $mainSkill.parentElement.classList.remove("d-none");
            if (weapon.mainSkills[index] == match["@id"]) {
              isSelected = true;
              let $mainSkillSelected = $mainSkillSelecteds[weaponIndex][index];
              $mainSkillSelected.src = $mainSkill.src;
              $mainSkillSelected.dataset.id = $mainSkill.dataset.id;
            }
          } else $mainSkill.parentElement.classList.add("d-none");
        });
        if (isSelected) $mainSkills.forEach((el) => el.parentElement.classList.add("d-none"));
        mainSkillCount++;
      }
    }
  });
  $loadingSpinners[weaponIndex].forEach((el) => el.classList.add("d-none"));
  $weaponSidebars[weaponIndex].classList.remove("d-none");
  $skillSections[weaponIndex].classList.remove("d-none");
};

/**
 * Event du changement d'arme
 */
$weaponSelects.forEach(($weaponSelect, weaponIndex) => {
  $weaponSelect.addEventListener("change", () => {
    const $selectedOption = $weaponSelect.options[$weaponSelect.selectedIndex];
    if (window.currentWeapons[weaponIndex]?.id == $selectedOption.value) return;
    if (window.currentWeapons[weaponIndex] == null && $selectedOption.value == 0) return;
    changeWeapon(weaponIndex, $selectedOption.value);
  });
});

/**
 * Event du click sur un skill
 * Condition activation / desactivation
 * Mise a jour mainSkill si besoin
 */
$skillContainers.forEach(($skillContainers, weaponIndex) => {
  $skillContainers.forEach(($skillContainer) => {
    new Popover($skillContainer, {
      title: "Titre",
      content: "Description",
      trigger: "hover",
      customClass: "skillContainerPopover",
    });

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
          changePopover($skillContainer, skill.skillKey, window.messageLocal["NoMorePoint"]);
          return;
        }

        // 2. Si skill enfant, si skill parent inactive
        if (skill.parent) {
          let parent = weapon.skills.filter((s) => s["@id"] == skill.parent)[0];
          if (!parent.active) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["TopSkill"] + window.weaponLocal[parent.skillKey]);
            return;
          }
        }
        // 3. Si pas la première ligne, si aucun skill ligne précédente active
        if (skill.line != 1 && weapon.skills.filter((s) => s.side == skill.side && s.line == skill.line - 1 && s.active).length == 0) {
          changePopover($skillContainer, skill.skillKey, window.messageLocal["Rowtop"]);
          return;
        }

        // 4. Si ultimate, si pas 10 point attribué sur le side
        if (skill.line == 6) {
          if (weapon.countdown[skill.side] < 10) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["TenPointSelect"] + window.weaponLocal[weapon.branch[skill.side - 1]]);
            return;
          }
        }

        skill.active = true;
        setBrightness($skillContainer, skill);
        changePopover($skillContainer, skill.skillKey, skill.skillKey);
        weapon.countdown[0]--;
        weapon.countdown[skill.side]++;
        if (skill.type == 1) {
          $qa(`.mainSkill[data-id="${skill.id}"]`).forEach(($mainSkill) => {
            $mainSkill.parentElement.classList.remove("d-none");
          });
        }
      }

      //Conditions pour eteindre le skill
      else {
        // 1. Si skill parent, si skill enfant active
        if (skill.children.length > 0) {
          let ActiveChildren = skill.children.filter((c) => weapon.skills.filter((s) => s["@id"] == c && s.active)[0]);
          if (ActiveChildren.length > 0) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["BottomSkill"] + window.weaponLocal[weapon.skills.filter((s) => s["@id"] == ActiveChildren[0])[0].skillKey]);
            return;
          }
        }

        // 2. Si skills ligne suivante active et pas de skill meme ligne active
        if (skill.line != 6 && weapon.skills.filter((s) => s.side == skill.side && s.line == skill.line + 1 && s.active).length > 0) {
          if (weapon.skills.filter((s) => s.line == skill.line && s.active).length > 0) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["RowBottom"]);
            return;
          }
        }

        // 3. Si point dépenser dans la branche = 11, si skill derniere ligne active
        if (weapon.countdown[skill.side] == 11) {
          let LastLineSkill = weapon.skills.filter((s) => s.side == skill.side && s.line == 6 && s.active);
          if (LastLineSkill.length > 0) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["BottomSkill"] + window.weaponLocal[weapon.skills.filter((s) => s["@id"] == LastLineSkill[0])[0].skillKey]);
          }
          return;
        }

        skill.active = false;
        setBrightness($skillContainer, skill);
        changePopover($skillContainer, skill.skillKey, skill.skillKey);
        weapon.countdown[0]++;
        weapon.countdown[skill.side]--;
        if (skill.type == 1) {
          $qa(`.mainSkill[data-id="${skill.id}"]`).forEach(($mainSkill, index) => {
            $mainSkill.parentElement.classList.add("d-none");
            let $mainSkillSelected = $mainSkillSelecteds[weaponIndex][index];
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

/**
 * Event click sur un mainSkill
 */
$mainSkills.forEach(($mainSkill) => {
  $mainSkill.addEventListener("click", () => {
    let data = $mainSkill.id.split("-");
    let weaponIndex = data[1] - 1;
    let cadre = data[2];
    let skillId = $mainSkill.dataset.id;
    let $mainSkillSelected = $mainSkillSelecteds[weaponIndex][cadre - 1];
    $qa(`.mainSkill[data-id="${$mainSkillSelected.dataset.id}"]`).forEach((el) => el.parentElement.classList.remove("d-none"));
    $qa(`.mainSkill[data-id="${skillId}"]`).forEach((el) => el.parentElement.classList.add("d-none"));
    $mainSkillSelected.dataset.id = skillId;
    $mainSkillSelected.src = $mainSkill.src;
    window.currentWeapons[weaponIndex].mainSkills[cadre - 1] = "/api/skills/" + skillId;
  });
});

/**
 * Event de suppresion d'un mainSkill
 */
$mainSkillDeletes.forEach(($mainSkillDelete) => {
  $mainSkillDelete.addEventListener("click", (e) => {
    let data = $mainSkillDelete.id.split("-");
    let weaponIndex = data[1] - 1;
    let cadre = data[2];
    let $mainSkillSelected = $mainSkillSelecteds[weaponIndex][cadre - 1];
    let skillId = $mainSkillSelected.dataset.id;
    $qa(`.mainSkill[data-id="${skillId}"]`).forEach((el) => el.parentElement.classList.remove("d-none"));
    $mainSkillSelected.dataset.id = 0;
    $mainSkillSelected.src = "/img/emptyCadre.png";
    window.currentWeapons[weaponIndex].mainSkills[cadre - 1] = null;
  });
});

/**
 * Event de reset
 */
$weaponResetButtons.forEach(($weaponResetButton, weaponIndex) => {
  $weaponResetButton.addEventListener("click", () => {
    let weapon = window.currentWeapons[weaponIndex];
    weapon.skills.forEach((s) => (s.active = false));
    weapon.countdown = [19, 0, 0];
    weapon.mainSkills = [null, null, null];
    changeWeapon(weaponIndex, weapon.id);
  });
});

$formBuildName.addEventListener("change", () => {
  if ($formBuildName.value.length >= 8) $formBuildNameInvalid.classList.add("d-none");
});

$formBuildSave.addEventListener("click", async () => {
  $formBuildSave.disabled = true;
  formBuildSaveLoader.classList.remove("d-none");
  let build = {
    name: $formBuildName.value,
    description: $formBuildDesc.value,
    type: parseInt($formBuildType.value),
    weapons: window.currentWeapons.map((w) => w?.["@id"]),
    activeSkills: window.currentWeapons.map((w) => w?.skills.filter((s) => s.active).map((s) => s["@id"])),
    mainSkills: window.currentWeapons.map((w) => w?.mainSkills),
  };

  let error = false;

  if (build.name.length < 8) {
    $formBuildNameInvalid.classList.remove("d-none");
    error = true;
  }

  if (!build.weapons[0] && !build.weapons[1]) {
    $weaponTabs.forEach((el) => el.classList.add("text-danger"));
    error = true;
  }

  if (!error) {
    build.weapons = build.weapons.map((w) => (!w ? "/api/weapons/1" : w));
    let response = await fetch(`/api/builds${window.buildId ? `/${window.buildId}` : ""}`, {
      headers: { "Content-Type": "application/json" },
      method: window.buildId ? "PUT" : "POST",
      body: JSON.stringify(build),
    });
    if (200 <= response.status && response.status < 300) {
      let data = await response.json();
      window.location.href = "/build/" + data.id;
    } else alert("Server Error, Please contact Admin");
  }

  $formBuildSave.disabled = false;
  formBuildSaveLoader.classList.add("d-none");
});
