import "../css/weapon.scss";
import { $q, $qa, MAX_ROW, MAX_COL } from "./global";

const $weaponSelect = $q("#weaponSelect");
const $weaponForm = $q("#weaponForm");
const $weaponFormKey = $weaponForm.querySelector('input[data-type="wkey"]')
const $weaponFormB1 = $weaponForm.querySelector('input[data-type="b1key"]')
const $weaponFormB2 = $weaponForm.querySelector('input[data-type="b2key"]')
const $sendWeaponBtn = $q('.weaponAction[data-type="submit"]');
const $deleteWeaponBtn = $q('.weaponAction[data-type="delete"]');

const $skillSection = $q("#skillSection");
const $skillForm = $q("#skillForm");
const $skillFormId = $skillForm.querySelector('[data-type="sid"]')
const $skillFormKey = $skillForm.querySelector('[data-type="skey"]')
const $skillFormImage = $skillForm.querySelector('[data-type="sikey"]')
const $skillFormParent = $skillForm.querySelector('[data-type="sparent"]')
const $sendSkillBtn = $q('.skillAction[data-type="submit"]');
const $deleteSkillBtn = $q('.skillAction[data-type="delete"]');

const $svgContainer = $qa(".svgContainer")

/* Fonction de Requete adaptative */
const request = async (url, method, body, callback) => {
  let args = { headers: { "Content-Type": "application/json" }, method: method };
  if (body != undefined) args.body = JSON.stringify(body);
  let response = await fetch(url, args);
  if (200 <= response.status && response.status < 300) window.setTimeout(() => callback(), 500);
  else console.log("Erreur");
};

const postEntity = (type, id, body, callback) => {
  let method
  if (id == 0) method = "POST"
  else method = "PUT"
  request(`/api/${type}${id == 0 ? "" : '/'+id}`, method, body, callback);
}

/* Ajouter / Mettre a jour une arme */
$sendWeaponBtn.addEventListener("click", () => {
  postEntity('weapons', $weaponSelect.value, {weaponKey: $weaponFormKey.value, branch: [$weaponFormB1.value, $weaponFormB2.value]}, getWeapon)
});

/* Supprimer une arme */
$deleteWeaponBtn.addEventListener("click", () => {
  if ($weaponSelect.value == 0) return
  if (window.confirm(`Delete weapon "${$weaponSelect.options[$weaponSelect.selectedIndex].innerText}" ?`)) {
    request(`/api/weapons/${$weaponSelect.value}`, "DELETE", undefined, getWeapon);
  }  
});

/* Ajouter / Mettre a jour un skill */
$sendSkillBtn.addEventListener("click", () => {
  let body = {
    skillKey: $skillFormKey.value,
    weapon: `/api/weapons/${window.currentWeapon}`,
    side: parseInt($skillFormId.dataset.side),
    line: parseInt($skillFormId.dataset.row),
    col: parseInt($skillFormId.dataset.col)
  }
  if($skillFormParent.value != 0) body.parent = `/api/skills/${$skillFormParent.value}`
  postEntity('skills', $skillFormId.value, body, getSkills)
});

$skillFormParent.addEventListener("dragover", event => event.preventDefault());
$skillFormParent.addEventListener("drop", event => {
  event.preventDefault();
  if(window.$draggedSkill.id == "0" || window.$draggedSkill.dataset.id == $skillFormId.value) return
  $skillFormParent.value = window.$draggedSkill.dataset.id == 0 ? '' : window.$draggedSkill.dataset.id
})

/* Supprimer un skill */
$deleteSkillBtn.addEventListener("click", () => {
  let skillId = $skillFormId.value
  if (skillId == 0) return
  if (window.confirm(`Delete skill "${window.currentSkills.filter(s => s.id == skillId)[0].skillKey}" ?`)) {
    request(`/api/skills/${skillId}`, "DELETE", undefined, getSkills)
  }
});

/* Fonction de mise a jour de la liste d'arme */
const getWeapon = () => {
  fetch("/api/weapons")
    .then((response) => response.json())
    .then((data) => {
      Array.from($weaponSelect.children)
        .filter((c) => c.value != 0)
        .forEach((c) => c.remove())
      window.weapons = data["hydra:member"]
      window.weapons.forEach((weapon) => {
        let $weaponOption = document.createElement("option")
        $weaponOption.value = weapon.id
        $weaponOption.innerText = weapon.weaponKey
        $weaponSelect.appendChild($weaponOption)
      });
      Array.from($weaponSelect.children).filter((c) => c.value == 0)[0].selected = true
      fillCreateForm(undefined);
    })
}
getWeapon() 



/* Fonction de mise a jour des skills */
const getSkills = () => {
  fetch(`/api/weapons/${window.currentWeapon}/skills`)
  .then((response) => response.json())
  .then((data) => {
    $skillForm.classList.add("isHidden")
    window.currentSkills = data["hydra:member"]
    $svgContainer.forEach(el => el.firstElementChild.innerHTML = "")
    $qa(".skill-container").forEach((c) => {
      let d = c.id.split("-")
      let match = window.currentSkills.filter(s => s.side == d[1] && s.line == d[2] && s.col == d[3])[0]
      if(match){
        c.style.backgroundImage = `url('')`;
        c.firstElementChild.setAttribute("src", `/newworld_png/${match.skillKey}.png`)
        c.dataset.id =  match.id
        if(match.parent != undefined){
          let parentMatch = window.currentSkills.filter(s => s['@id'] == match.parent)[0]
          if (parentMatch){
            let bgSVG = $svgContainer[match.side - 1].firstElementChild
            bgSVG.innerHTML += `<line class="skillLine" 
            x1="${(parentMatch.col * 100) / MAX_COL - 10}%" y1="${(parentMatch.line * 100) / MAX_ROW - 10}%" 
            x2="${(match.col * 100) / MAX_COL - 10}%" y2="${(match.line* 100) / MAX_ROW - 10}%"/>`;
          }
        }
      }
      else{
        c.style.backgroundImage = `url('/img/emptyCadre.png')`;
        c.firstElementChild.setAttribute("src", "/img/emptyCadre.png")
        c.dataset.id = 0
      }
    });
    $skillSection.classList.remove("isHidden")
  });
};

/* Au changement d'arme */
$weaponSelect.addEventListener("change", () => {
  let selectedValue = $weaponSelect.value;
  if (selectedValue == 0) return fillCreateForm(undefined);
  fillCreateForm(window.weapons.filter((w) => w.id == selectedValue)[0]);
});

/* Mise a jour du contenu en fonction de l'arme selectionnée */
const fillCreateForm = (weapon) => {
  if (weapon === undefined) {
    $skillSection.classList.add("isHidden")
    $weaponFormKey.value = ""
    $weaponFormB1.value = ""
    $weaponFormB2.value = ""
  } else {
    $skillForm.classList.add("isHidden")
    $weaponFormKey.value = weapon.weaponKey
    $weaponFormB1.value = weapon.branch[0]
    $weaponFormB2.value = weapon.branch[1]
    $q("#branchName-1").innerText = weapon.branch[0]
    $q("#branchName-2").innerText = weapon.branch[1]
    window.currentWeapon = weapon.id
    getSkills()
  }
};

$qa(".skill-container").forEach((skillContainer) => {

  /* Au click d'un contenaire skill */
  skillContainer.addEventListener("click", () => {
    let data = skillContainer.id.split('-')
    let skillId = skillContainer.dataset.id
    $skillForm.classList.remove("isHidden");
    let match = window.currentSkills.filter(s => s.id == skillId)[0]
    $skillFormKey.value = match ? match.skillKey : ''
    $skillFormImage.value = match ? match.skillKey : ''
    $skillFormParent.value = (match && match.parent) ? match.parent.split('/').reverse()[0] : ''
    $skillFormId.value = skillId
    $skillFormId.dataset.side = data[1]
    $skillFormId.dataset.row = data[2]
    $skillFormId.dataset.col = data[3]
  });

  /* Au drop d'un contenaire skill */
  skillContainer.addEventListener("dragover", event => event.preventDefault());
  skillContainer.addEventListener("drop", event => {
    event.preventDefault();
    if (!event.target.classList.contains('skill-container-img')) return
    if (event.target.parentElement == window.$draggedSkill) return
    let match = window.currentSkills.filter(s => s.id == window.$draggedSkill.dataset.id)[0]
    if(match == undefined) return
    let data = event.target.parentElement.id.split('-')
    if(event.target.parentElement.dataset.id != "0") {window.alert('There is already a skill at this place'); return}
    if(window.confirm(`Move "${match.skillKey}" from side:${match.side}, row:${match.line}, col:${match.col} to side:${data[1]}, row:${data[2]}, col:${data[3]} ?`)){
      postEntity('skills', match.id, {side: parseInt(data[1]), line: parseInt(data[2]), col: parseInt(data[3])}, getSkills)
    }
  })

});

