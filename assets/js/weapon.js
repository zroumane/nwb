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
const $svgContainer = $qa(".svgContainer")

const $skillForm = $q("#skillForm");
const $skillFormTitle = $skillForm.querySelector('#skillFormTitle')
const $skillFormTitleId = $skillForm.querySelector('#skillFormTitleId')
const $skillFormId = $skillForm.querySelector('#skillFormId')
const $skillFormSkillKey = $skillForm.querySelector('#skillFormSkillKey')
const $skillFormBgShape = $skillForm.querySelector('#skillFormBgShape')
const $skillFormBgColor = $skillForm.querySelector('#skillFormBgColor')
const $skillFormParent = $skillForm.querySelector('#skillFormParent')
const $skillFormParentDelete = $skillForm.querySelector('#skillFormParentDelete')
const $skillFormSide = $skillForm.querySelector('#skillFormSide')
const $skillFormRow = $skillForm.querySelector('#skillFormRow')
const $skillFormCol = $skillForm.querySelector('#skillFormCol')


const $skillFormSend = $q('.skillAction[data-type="submit"]');
const $skillFormDelete = $q('.skillAction[data-type="delete"]');


const clearSkillOutline = () => {
  let lastSkill = $q(`#skill-${$skillFormSide.value}-${$skillFormRow.value}-${$skillFormCol.value}`)
  if (lastSkill) lastSkill.style.outline = ""
}

/* Fonction de Requete adaptative */
const request = async (url, method, body, callback) => {
  let args = { headers: { "Content-Type": "application/json" }, method: method };
  if (body != undefined) args.body = JSON.stringify(body);
  let response = await fetch(url, args);
  if (200 <= response.status && response.status < 300) window.setTimeout(() => callback(), 500);
  else response.json().then(d => alert(d['hydra:description']))
};

const postEntity = (type, id, body, callback) => {
  let method
  if (id == 0) method = "POST"
  else method = "PUT"
  request(`/api/${type}${id == 0 ? "" : '/'+id}`, method, body, callback);
}


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

/* Mise a jour du contenu en fonction de l'arme selectionnée */
const fillCreateForm = (weapon) => {
  $skillForm.classList.add("isHidden")
  $weaponFormKey.value = weapon ? weapon.weaponKey : ""
  $weaponFormB1.value = weapon ? weapon.branch[0] : ""
  $weaponFormB2.value = weapon ? weapon.branch[1] : ""
  $q("#branchName-1").innerText = weapon ? weapon.branch[0] : ""
  $q("#branchName-2").innerText = weapon ? weapon.branch[1] : ""
  if(weapon != undefined){
    window.currentWeapon = weapon.id
    getSkills()
  }
};

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
        c.style.backgroundImage = `url('/newworld_png/${match.bgName}')`;
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
    clearSkillOutline()
    $skillSection.classList.remove("isHidden")
  });
};

/* Ajouter / Mettre a jour un skill */
$skillFormSend.addEventListener("click", () => {
  //TODO: verif
  let body = {
    skillKey: $skillFormSkillKey.value,
    weapon: `/api/weapons/${window.currentWeapon}`,
    side: parseInt($skillFormSide.value),
    line: parseInt($skillFormRow.value),
    col: parseInt($skillFormCol.value),
    bgName: `abilities_bg${!$skillFormBgShape.checked ? "_passive" : ""}${$skillFormBgColor.querySelector('[type="radio"]:checked').value}.png`,
    parent: $skillFormParent.dataset.parentId != 0 ? `/api/skills/${$skillFormParent.dataset.parentId}` : null
  }
  if($skillFormParent.dataset.parentId != 0) body.parent = `/api/skills/${$skillFormParent.dataset.parentId}`
  postEntity('skills', $skillFormId.value, body, getSkills)
});

/** Drap and drop event parent skill */
$skillFormParent.addEventListener("dragover", event => event.preventDefault());
$skillFormParent.addEventListener("drop", event => {
  event.preventDefault();
  if(window.$draggedSkill.dataset.id == 0 || window.$draggedSkill.dataset.id == $skillFormId.value) return
  $skillFormParent.dataset.parentId = window.$draggedSkill.dataset.id
  $skillFormParent.src = window.$draggedSkill.firstElementChild.src
})
$skillFormParentDelete.addEventListener("click", () => {
  $skillFormParent.dataset.parentId = 0
  $skillFormParent.src = "/img/emptyCadre.png"
})

/* Supprimer un skill */
$skillFormDelete.addEventListener("click", () => {
  let skillId = $skillFormId.value
  if (skillId == 0) return
  if (window.confirm(`Delete skill "${window.currentSkills.filter(s => s.id == skillId)[0].skillKey}" ?`)) {
    request(`/api/skills/${skillId}`, "DELETE", undefined, getSkills)
  }
});


/* Au changement d'arme */
$weaponSelect.addEventListener("change", () => {
  $skillSection.classList.add("isHidden")
  let selectedValue = $weaponSelect.value;
  if (selectedValue == 0) return fillCreateForm(undefined);
  fillCreateForm(window.weapons.filter((w) => w.id == selectedValue)[0]);
});



$qa(".skill-container").forEach((skillContainer) => {

  /* Au click d'un contenaire skill */
  skillContainer.addEventListener("click", async () => {
    await clearSkillOutline()
    skillContainer.style.outline = "3px blue solid"
    let data = skillContainer.id.split('-')
    let skillId = skillContainer.dataset.id
    if (skillId == 0) {
      $skillFormTitle.innerText = "Create Skill"
      $skillFormTitleId.innerText = ""
    }else{
      $skillFormTitle.innerText = "Update Skill "
      $skillFormTitleId.innerText = skillId
    }
    let match = window.currentSkills.filter(s => s.id == skillId)[0]
    $skillFormSkillKey.value = match ? match.skillKey : ''
    $skillFormBgShape.checked = match == undefined ? false : match.bgName.includes('_passive') ? false : true
    $skillFormBgColor.querySelector(`input[value="${match ? match.bgName.replace(/\D/g, "") : 1}"]`).checked = true
    $skillFormParent.dataset.parentId = (match && match.parent) ? match.parent.split('/').reverse()[0] : ''
    $skillFormParent.src = (match && match.parent) ? `/newworld_png/${window.currentSkills.filter(s => s['@id'] == match.parent)[0].skillKey}.png` : "/img/emptyCadre.png"
    $skillFormId.value = skillId
    $skillFormSide.value = data[1]
    $skillFormRow.value = data[2]
    $skillFormCol.value = data[3]
    $skillForm.classList.remove("isHidden");
  });

  /* Au drop d'un contenaire skill */
  skillContainer.addEventListener("dragover", event => event.preventDefault());
  skillContainer.addEventListener("dragenter", event => event.target.style.outline = "3px red solid");
  skillContainer.addEventListener("dragleave", event => event.target.style.outline = "");
  skillContainer.addEventListener("drop", event => {
    event.preventDefault();
    if (!event.target.classList.contains('skill-container-img')) return
    event.target.style.outline = ""
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

