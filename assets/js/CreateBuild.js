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

const $activedSkills = $qa(".activedSkill");
const $activedSkillLists = [$qa(".activedSkillList1"), $qa(".activedSkillList2")];
const $activedSkillSelecteds = [$qa(".activedSkillSelected1"), $qa(".activedSkillSelected2")];
const $activedSkillDeletes = $qa(".activedSkillDelete");

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
      console.log(weapon);
      $weaponSelects[weaponIndex].value = weapon.id;
      await getSkills(weapon);
      weapon.countdown = [19, 0, 0];
      console.log(build);
      build.selectedSkills[weaponIndex].forEach((skill) => {
        weapon.skills.filter((s) => s["@id"] == skill)[0].selected = true;
        weapon.countdown[0]--;
        weapon.countdown[skill.side]++;
      });
      weapon.activedSkills = build.activedSkills[weaponIndex];
      $weaponSelects[weaponIndex].value = weapon.id;
      await changeWeapon(weaponIndex, weapon.id);
    });
  }
  formBuildSave.classList.remove("d-none");
};

main();

/**
 * Mise en place d'une arme (weaponId) dans l'onglet correspondant (weaponIndex)
 * Fetch les skills si ce n'est pas déja fait. Mise en forme des skills, activedSkills
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
  if (!weapon.activedSkills) weapon.activedSkills = [null, null, null];
  if (!weapon.countdown) weapon.countdown = [19, 0, 0];
  setCountdown(weaponIndex);
  $skillContainers[weaponIndex].forEach((el) => Pop(el).disable());
  $svgContainers[weaponIndex].forEach((el) => (el.firstElementChild.innerHTML = ""));
  for (let c = 1; c <= 3; c++) {
    let $activedSkills = $activedSkillLists[weaponIndex][c - 1].children;
    $activedSkills.forEach(($activedSkill) => {
      $activedSkill.firstElementChild.dataset.id = 0;
      $activedSkill.firstElementChild.src = "/img/emptyCadre.png";
      $activedSkill.classList.add("d-none");
    });
    let $activedSkillSelected = $activedSkillSelecteds[weaponIndex][c - 1];
    $activedSkillSelected.dataset.id = 0;
    $activedSkillSelected.src = "/img/emptyCadre.png";
  }
  let activedSkillCount = 1;
  $skillContainers[weaponIndex].forEach(($skillContainer) => {
    $skillContainer.style.filter = `brightness(1)`;
    let data = $skillContainer.id.split("-");
    let match = weapon.skills.filter((s) => s.side == data[2] && s.line == data[3] && s.col == data[4])[0];
    $skillContainer.style.backgroundImage = match ? `url('/img/bg/bg${match.bgColor}${match.type == 1 ? "" : "c"}.png')` : "";
    $skillContainer.style.backgroundSize = match ? ([1, 3].includes(match.type) ? "90% 90%" : "70% 70%") : "";
    $skillContainer.firstElementChild.style.backgroundImage = match ? `url(/img/skill/${match.skillKey}.png)` : "";
    $skillContainer.firstElementChild.style.backgroundSize = match ? ([1, 3].includes(match.type) ? "90% 90%" : "70% 70%") : "";
    $skillContainer.dataset.id = match ? match.id : 0;
    changePopover($skillContainer, match ? match.skillKey : "", match ? match.skillKey : "");
    if (match) {
      Pop($skillContainer).enable();
      if (match.selected == undefined) match.selected = false;
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
        let $activedSkills = [];
        $activedSkillLists[weaponIndex].forEach((ul) => $activedSkills.push(ul.querySelector(`img[data-li="${activedSkillCount}"]`)));
        $activedSkills.forEach(($activedSkill, index) => {
          $activedSkill.src = `/img/skill/${match.skillKey}.png`;
          $activedSkill.dataset.id = match.id;
          if (match.selected) {
            $activedSkill.parentElement.classList.remove("d-none");
            if (weapon.activedSkills[index] == match["@id"]) {
              isSelected = true;
              let $activedSkillSelected = $activedSkillSelecteds[weaponIndex][index];
              $activedSkillSelected.src = $activedSkill.src;
              $activedSkillSelected.dataset.id = $activedSkill.dataset.id;
            }
          } else $activedSkill.parentElement.classList.add("d-none");
        });
        if (isSelected) $activedSkills.forEach((el) => el.parentElement.classList.add("d-none"));
        activedSkillCount++;
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
 * Mise a jour activedSkill si besoin
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
      if (!skill.selected) {
        // 1. Si tous les point utiliser
        if (weapon.countdown[0] == 0) {
          changePopover($skillContainer, skill.skillKey, window.messageLocal["NoMorePoint"]);
          return;
        }

        // 2. Si skill enfant, si skill parent unselected
        if (skill.parent) {
          let parent = weapon.skills.filter((s) => s["@id"] == skill.parent)[0];
          if (!parent.selected) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["TopSkill"] + window.weaponLocal[parent.skillKey]);
            return;
          }
        }
        // 3. Si pas la première ligne, si aucun skill ligne précédente selected
        if (skill.line != 1 && weapon.skills.filter((s) => s.side == skill.side && s.line == skill.line - 1 && s.selected).length == 0) {
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

        skill.selected = true;
        setBrightness($skillContainer, skill);
        changePopover($skillContainer, skill.skillKey, skill.skillKey);
        weapon.countdown[0]--;
        weapon.countdown[skill.side]++;
        if (skill.type == 1) {
          $qa(`.activedSkill[data-id="${skill.id}"]`).forEach(($activedSkill) => {
            $activedSkill.parentElement.classList.remove("d-none");
          });
        }
      }

      //Conditions pour eteindre le skill
      else {
        // 1. Si skill parent, si skill enfant selected
        if (skill.children.length > 0) {
          let ActiveChildren = skill.children.filter((c) => weapon.skills.filter((s) => s["@id"] == c && s.selected)[0]);
          if (ActiveChildren.length > 0) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["BottomSkill"] + window.weaponLocal[weapon.skills.filter((s) => s["@id"] == ActiveChildren[0])[0].skillKey]);
            return;
          }
        }

        // 2. Si skills ligne suivante selected et pas de skill meme ligne selected
        if (skill.line != 6 && weapon.skills.filter((s) => s.side == skill.side && s.line == skill.line + 1 && s.selected).length > 0) {
          if (weapon.skills.filter((s) => s.line == skill.line && s.selected).length == 1) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["RowBottom"]);
            return;
          }
        }

        // 3. Si point dépenser dans la branche = 11, si skill derniere ligne selected
        if (weapon.countdown[skill.side] == 11) {
          let LastLineSkill = weapon.skills.filter((s) => s.side == skill.side && s.line == 6 && s.selected);
          if (LastLineSkill.length > 0) {
            changePopover($skillContainer, skill.skillKey, window.messageLocal["BottomSkill"] + window.weaponLocal[weapon.skills.filter((s) => s["@id"] == LastLineSkill[0])[0].skillKey]);
          }
          return;
        }

        skill.selected = false;
        setBrightness($skillContainer, skill);
        changePopover($skillContainer, skill.skillKey, skill.skillKey);
        weapon.countdown[0]++;
        weapon.countdown[skill.side]--;
        if (skill.type == 1) {
          $qa(`.activedSkill[data-id="${skill.id}"]`).forEach(($activedSkill, index) => {
            $activedSkill.parentElement.classList.add("d-none");
            let $activedSkillSelected = $activedSkillSelecteds[weaponIndex][index];
            if ($activedSkillSelected.dataset.id == skill.id) {
              $activedSkillSelected.dataset.id = 0;
              $activedSkillSelected.src = "/img/emptyCadre.png";
              weapon.activedSkills[index] = null;
            }
          });
        }
      }
      setCountdown(weaponIndex);
    });
  });
});

/**
 * Event click sur un activedSkill
 */
$activedSkills.forEach(($activedSkill) => {
  $activedSkill.addEventListener("click", () => {
    let data = $activedSkill.id.split("-");
    let weaponIndex = data[1] - 1;
    let cadre = data[2];
    let skillId = $activedSkill.dataset.id;
    let $activedSkillSelected = $activedSkillSelecteds[weaponIndex][cadre - 1];
    $qa(`.activedSkill[data-id="${$activedSkillSelected.dataset.id}"]`).forEach((el) => el.parentElement.classList.remove("d-none"));
    $qa(`.activedSkill[data-id="${skillId}"]`).forEach((el) => el.parentElement.classList.add("d-none"));
    $activedSkillSelected.dataset.id = skillId;
    $activedSkillSelected.src = $activedSkill.src;
    window.currentWeapons[weaponIndex].activedSkills[cadre - 1] = "/api/skills/" + skillId;
  });
});

/**
 * Event de suppresion d'un activedSkill
 */
$activedSkillDeletes.forEach(($activedSkillDelete) => {
  $activedSkillDelete.addEventListener("click", (e) => {
    let data = $activedSkillDelete.id.split("-");
    let weaponIndex = data[1] - 1;
    let cadre = data[2];
    let $activedSkillSelected = $activedSkillSelecteds[weaponIndex][cadre - 1];
    let skillId = $activedSkillSelected.dataset.id;
    $qa(`.activedSkill[data-id="${skillId}"]`).forEach((el) => el.parentElement.classList.remove("d-none"));
    $activedSkillSelected.dataset.id = 0;
    $activedSkillSelected.src = "/img/emptyCadre.png";
    window.currentWeapons[weaponIndex].activedSkills[cadre - 1] = null;
  });
});

/**
 * Event de reset
 */
$weaponResetButtons.forEach(($weaponResetButton, weaponIndex) => {
  $weaponResetButton.addEventListener("click", () => {
    let weapon = window.currentWeapons[weaponIndex];
    weapon.skills.forEach((s) => (s.selected = false));
    weapon.countdown = [19, 0, 0];
    weapon.activedSkills = [null, null, null];
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
    weapons: window.currentWeapons.map((w) => w?.["@id"] || null),
    selectedSkills: window.currentWeapons.map((w) => w?.skills.filter((s) => s.selected).map((s) => s["@id"]) || []),
    activedSkills: window.currentWeapons.map((w) => w?.activedSkills || [null, null, null]),
  };

  console.log(build);

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
    let response = await fetch(`/api/builds${window.buildId ? `/${window.buildId}` : ""}`, {
      headers: { "Content-Type": "application/json" },
      method: window.buildId ? "PUT" : "POST",
      body: JSON.stringify(build),
    });
    let data = await response.json();
    if (200 <= response.status && response.status < 300) {
      window.location.href = "/build/" + data.id;
    } else alert("Server Error, Please contact Admin\n" + data["hydra:description"]);
  }

  $formBuildSave.disabled = false;
  formBuildSaveLoader.classList.add("d-none");
});
