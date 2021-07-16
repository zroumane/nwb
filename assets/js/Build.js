import "../css/Build.scss";
import "bootstrap/js/dist/tab";
import { $q, $qa, MAX_COL, MAX_ROW, lang } from "./Global";
import { getMethod, getBuildId, setBrightness } from "./Utils";

const $spinner = $q("#spinner");
const $buildTabs = $qa(".buildTab");
const $skillSection = $q("#skillSection");
const $branchNames = [$qa(".branchName1"), $qa(".branchName2")];
const $svgContainers = [$qa(".svgContainer1"), $qa(".svgContainer2")];

const main = async () => {
  window.weaponLocal = await getMethod(`/json/${lang}/weapon.json`);
  window.skillLocal = await getMethod(`/json/${lang}/skill.json`);
  let data = await fetch(`/api/builds/${getBuildId()}`);
  let build = await data.json();
  console.log(build);
  build.weapons.forEach(async (weaponIRI, weaponIndex) => {
    if (weaponIRI) {
      let weapon = await (await fetch(weaponIRI)).json();
      weapon.branch.forEach((b, i) => {
        $branchNames[weaponIndex][i].innerText = window.weaponLocal[b];
      });
      weapon.skills = (await (await fetch(weaponIRI + "/skills")).json())["hydra:member"];
      console.log(weapon);
      weapon.skills.forEach(async (skill) => {
        let $skillContainer = $q(`#skill-${weaponIndex + 1}-${skill.side}-${skill.line}-${skill.col}`);
        $skillContainer.style.backgroundImage = `url('/img/bg/bg${skill.bgColor}${skill.type == 1 ? "" : "c"}.png')`;
        $skillContainer.style.backgroundSize = [1, 3].includes(skill.type) ? "90% 90%" : "70% 70%";
        $skillContainer.firstElementChild.style.backgroundImage = `url(/img/skill/${skill.skillKey}.png)`;
        $skillContainer.firstElementChild.style.backgroundSize = [1, 3].includes(skill.type) ? "90% 90%" : "70% 70%";
        build.selectedSkills[weaponIndex].includes(skill["@id"]) ? (skill.selected = true) : (skill.selected = false);
        setBrightness($skillContainer, skill);
        if (skill.parent) {
          let parent = weapon.skills.filter((s) => s["@id"] == skill.parent)[0];
          if (parent) {
            let bgSVG = $svgContainers[weaponIndex][skill.side - 1].firstElementChild;
            bgSVG.innerHTML += `<line class="skillLine" 
              x1="${(parent.col * 100) / MAX_COL - 10}%" y1="${(parent.line * 100) / MAX_ROW - 10}%" 
              x2="${(skill.col * 100) / MAX_COL - 10}%" y2="${(skill.line * 100) / MAX_ROW - 10}%"/>`;
          }
        }
      });
      build.activedSkills[weaponIndex].forEach((activedSkill, i) => {
        if (activedSkill) {
          let match = weapon.skills.filter((s) => s["@id"] == activedSkill)[0];
          $q(`#activedSkill-${weaponIndex + 1}-${i + 1}`).src = `/img/skill/${match.skillKey}.png`;
        }
      });
      $buildTabs[weaponIndex].innerText = window.weaponLocal[weapon.weaponKey];
      $buildTabs[weaponIndex].classList.remove("disabled");
    }
  });
  if (build.gears) {
    $buildTabs[2].classList.remove("disabled");
  }
  if (build.stats) {
    $buildTabs[3].classList.remove("disabled");
  }
  $spinner.classList.add("d-none");
  $skillSection.classList.remove("d-none");
};
main();
