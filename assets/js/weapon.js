import "../css/weapon.scss";
import { $q, $qa } from "./global";

const $weaponSelect = $q("#weaponSelect");
const $weaponForm = $q("#weaponForm");
const $skillSection = $q("#skillSection");
const $skillForm = $q("#skillForm");

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
    weapon.skills.forEach((skill) => {
      var $skillContainer = $q(`#skill-${skill.side}-${skill.line}-${skill.col}`);
      console.log($skillContainer);
      $skillContainer.style.backgroundImage = "url('../newworld_png/abilities_bg2.png')";
      $skillContainer.firstElementChild.setAttribute("src", "/newworld_png/bowability6_mod2.png");
    });
  }
};

/* Supprimer une arme */
const $deleteWeaponBtn = $q('.weaponAction[data-type="delete"]');
$deleteWeaponBtn.addEventListener("click", () => {
  if ($weaponSelect.value == 0) return;
  request(`/api/weapons/${$weaponSelect.value}`, "delete", undefined, getWeapon);
});

/* Ajouter / Mettre a jour une arme */
const $sendWeaponBtn = $q('.weaponAction[data-type="submit"]');
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
    var data = skillContainer.id.split("-");
    var side = data[1];
    var row = data[2];
    var col = data[3];
    $skillForm.classList.remove("isHidden");
  });
});
