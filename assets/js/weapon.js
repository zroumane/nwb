import "../css/weapon.scss";
import { $q, $qa } from "./global";

const $weaponSelect = $q("#weaponSelect");
const $weaponForm = $q("#weaponForm");
const $skillSection = $q("#skillSection");
const $skillForm = $q("#skillForm");
const $deleteWeaponBtn = $q('.weaponAction[data-type="delete"]');
const $sendWeaponBtn = $q('.weaponAction[data-type="submit"]');
const $deleteSkillBtn = $q('.skillAction[data-type="delete"]');
const $sendSkillBtn = $q('.skillAction[data-type="submit"]');


/* Fonction de Request adaptative */
const request = async (url, method, body, callback) => {
  let args = { headers: { "content-Type": "application/json" }, method: method };
  if (body != undefined) args.body = JSON.stringify(body);
  let response = await fetch(url, args);
  if (200 <= response.status && response.status < 300) window.setTimeout(() => callback(), 500);
  else console.log("Erreur");
};

/* Fonction de mise a jour de la liste d'arme */
const getWeapon = () => {
  fetch("/api/weapons")
    .then((response) => response.json())
    .then((data) => {
      Array.from($q("#weaponSelect").children)
        .filter((c) => c.value != 0)
        .forEach((c) => c.remove());
      console.log(data["hydra:member"]);
      window.weapons = data["hydra:member"];
      window.weapons.forEach((weapon) => {
        var $weaponOption = document.createElement("option");
        $weaponOption.value = weapon.id;
        $weaponOption.innerText = weapon.weaponKey;
        $weaponSelect.appendChild($weaponOption);
      });
      Array.from($weaponSelect.children).filter((c) => c.value == 0)[0].selected = true;
      fillCreateForm(undefined);
    });
};
getWeapon();

/* Fonction de mise a jour des skills */
const getSkills = () => {
  fetch(`/api/weapons/${window.currentWeapon}/skills`)
  .then((response) => response.json())
  .then((data) => {
    window.currentSkills = data["hydra:member"]
    $qa(".skill-container").forEach((c) => {
      var d = c.id.split("-")
      var match = window.currentSkills.filter(s => s.side == d[1] && s.line == d[2] && s.col == d[3])[0]
      if(match){
        c.style.backgroundImage = `url('')`;
        c.firstElementChild.setAttribute("src", `${match.skillKey}.png`);
        c.setAttribute('skill-id', match.id)
      }else{
        c.style.backgroundImage = `url('')`;
        c.firstElementChild.setAttribute("src", "../img/emptyCadre.png");
        c.setAttribute('skill-id', 0)
      }
    });
  });
};

/* Au changement d'arme */
$weaponSelect.addEventListener("change", () => {
  var selectedValue = $weaponSelect.value;
  if (selectedValue == 0) return fillCreateForm(undefined);
  fillCreateForm(window.weapons.filter((w) => w.id == selectedValue)[0]);
});

/* Mise a jour du contenu en fonction de l'arme selectionnée */
const fillCreateForm = (weapon) => {
  if (weapon === undefined) {
    $skillSection.classList.add("isHidden");
    $weaponForm.querySelector('input[data-type="wkey"]').value = "";
    $weaponForm.querySelector('input[data-type="b1key"]').value = "";
    $weaponForm.querySelector('input[data-type="b2key"]').value = "";
  } else {
    $skillForm.classList.add("isHidden");
    $skillSection.classList.remove("isHidden");
    $weaponForm.querySelector('input[data-type="wkey"]').value = weapon.weaponKey;
    $weaponForm.querySelector('input[data-type="b1key"]').value = weapon.branch[0];
    $weaponForm.querySelector('input[data-type="b2key"]').value = weapon.branch[1];
    $q("#branchName-1").innerText = weapon.branch[0];
    $q("#branchName-2").innerText = weapon.branch[1];
    window.currentWeapon = weapon.id
    getSkills()
  }
};

/* Supprimer une arme */
$deleteWeaponBtn.addEventListener("click", () => {
  if ($weaponSelect.value == 0) return;
  request(`/api/weapons/${$weaponSelect.value}`, "delete", undefined, getWeapon);
});


/* Supprimer un skill */
$deleteSkillBtn.addEventListener("click", () => {
  var skillId = $skillForm.querySelector('[data-type="sid"]').value
  if (skillId == 0) return;
  request(`/api/skills/${skillId}`, "delete", undefined, getSkills);
});


/* Ajouter / Mettre a jour une arme */
$sendWeaponBtn.addEventListener("click", () => {
  var method,
    body,
    selectedValue = $weaponSelect.value == 0 ? "" : "/" + $weaponSelect.value;
  if ($weaponSelect.value == 0) method = "POST";
  else method = "PUT";
  body = {
    weaponKey: $weaponForm.querySelector('input[data-type="wkey"]').value,
    branch: [$weaponForm.querySelector('input[data-type="b1key"]').value, $weaponForm.querySelector('input[data-type="b2key"]').value],
  };
  request(`/api/weapons${selectedValue}`, method, body, getWeapon);
});

/* Au click d'un contenaire skill */
$qa(".skill-container").forEach((skillContainer) => {
  skillContainer.addEventListener("click", () => {
    console.log("aa")
    var data = skillContainer.id.split("-");
    var side = data[1];
    var row = data[2];
    var col = data[3];
    var skillId = skillContainer.getAttribute('skill-id')
    $skillForm.classList.remove("isHidden");
    var match = window.currentSkills.filter(s => s.id == skillId)[0]
    $skillForm.querySelector('[data-type="skey"]').value = match ? match.skillKey : ''
    $skillForm.querySelector('[data-type="sikey"]').value = match ? match.skillKey : ''
    $skillForm.querySelector('[data-type="sid"]').value = skillId
  });
});
