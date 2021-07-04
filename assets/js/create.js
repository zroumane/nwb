import "../css/create.scss";
import Popover from "bootstrap/js/dist/popover";
import Collapse from "bootstrap/js/dist/collapse";
import { $q, $qa } from "./global";

//initialise les popovers
var popoverTriggerList = [].slice.call($qa('[data-toggle="popover"]'));
popoverTriggerList.forEach((popoverTriggerEl) => {
  new Popover(popoverTriggerEl);
});

// fetch les traductions
fetch(`json/${window.lang}/weaponabilities.json`)
  .then((result) => result.json())
  .then((data) => {
    window.skillsInfo = data;
  });
fetch(`json/${window.lang}/messageSkill.json`)
  .then((result) => result.json())
  .then((data) => {
    window.messageSkill = data;
  });

//initialise les variables globales
var weaponObject = $q("#WeaponDataContainer").getAttribute("data-weapon");
if (!weaponObject) {
  window.globalWeapon = [];
  window.selectedWeapon = ["", ""];
  $q("#modetype0").selected = true;
  $qa('.optionChoixWeapon[value="0"]').forEach((el) => (el.selected = true));
} else {
  //TODO remplir les chnat en fonction des données récupéré (/edit/{id})
}

//executé au click du choix d'armes
$qa(".selectChoixWeapon").forEach((select) => {
  select.addEventListener("change", function () {
    var collapse = select.getAttribute("collapse");
    var option = Object.values(select.children).filter((child) => {
      if (child.selected == true) return child;
    })[0];

    //verifie si deja selectionné, si oui break
    if (window.selectedWeapon[collapse - 1] == option.getAttribute("value")) return;
    window.selectedWeapon[collapse - 1] = option.getAttribute("value");

    //enleve l'arme du menu deroulant deja choisi dans l'autre menu deroulant
    var negCollapse = `[collapse="${Math.abs(collapse - 3)}"]`;
    $q(`.optionChoixWeapon${negCollapse}`).style.display = "block";
    $q(`.optionChoixWeapon${negCollapse}[value = "${option.getAttribute("value")}"]`).style.display = "none";

    //appelle fonction de remplissage et si collapse ouverte attend fin fermeture
    var toChange = true;
    var collapseObject = $q(`#collapse-${collapse}`);
    if (collapseObject.classList.contains("show")) {
      Collapse.getInstance(collapseObject).hide();
      collapseObject.addEventListener("hidden.bs.collapse", function () {
        if (toChange) modifyCollapse(option);
        toChange = false;
      });
    } else {
      modifyCollapse(option);
      toChange = false;
    }
  });
});

//Reset skill
$qa(".resetButton").forEach((resetBtn) => {
  resetBtn.addEventListener("click", function () {
    var collapse = resetBtn.getAttribute("collapse");
    var option = $q(`.optionChoixWeapon[collapse="${collapse}"][value ="${window.selectedWeapon[collapse - 1]}"]`);
    window.globalWeapon.splice(window.globalWeapon.indexOf(window.globalWeapon.filter((w) => w.key == option.attr("value"))[0]), 1);
    modifyCollapse(option);
  });
});

//lance le setup de l'arme apres avoir verifier si deja presente dans les donners, sinon ajout
function modifyCollapse(option) {
  var value = option.getAttribute("value");
  if (window.globalWeapon.filter((w) => w.key == value).length == 0) {
    fetch(`json/${value}.json`)
      .then((result) => result.json())
      .then((data) => {
        window.globalWeapon.push(data);
        setupWeapon(option);
      });
  } else setupWeapon(option);
}

//fonction de vidage puis remplissage des collapses en fonction de l'arme
function setupWeapon(option) {
  //initiale les variables
  var option;
  var collapse = option.getAttribute("collapse");
  var weaponName = option.innerText;
  var weaponKey = option.getAttribute("value");
  var li = 1;

  //ajoute le nom de l'arme sur le button de collapse correspondant
  $q(`#buttonCollapse-${collapse}`).innerText = weaponName;

  //fait appraitre le body de la collapse et enleve le message "pas d'amre"
  $q(`.collapseAlert[collapse="${collapse}"]`).style.display = "none";
  $q(`#weaponCollapse-${collapse}`).style.display = "block";

  //reset complet
  $qa(`.bgSvg[collapse="${collapse}"]`).forEach((bgSVG) => {
    bgSVG.innerHTML = "";
  });
  $qa(`.skill-container[collapse = "${collapse}"]`).forEach((skillContainer) => {
    skillContainer.setAttribute("fill", "false");
    skillContainer.setAttribute("alert", "false");
    Popover.getInstance(skillContainer).disable();
  });
  $qa(`.skill-container-img[collapse = "${collapse}"]`).forEach((skillContainerimg) => {
    skillContainerimg.setAttribute("src", "img/emptyCadre.png");
  });
  $qa(`.mainskillli[collapse = "${collapse}"]`).forEach((mainSkillLi) => {
    mainSkillLi.setAttribute("src", "img/CadreSkill.png");
    mainSkillLi.setAttribute("skillkey", "");
    mainSkillLi.classList.add("d-none");
  });
  $qa(`.mainSkillSelected[collapse = "${collapse}"]`).forEach((mainSkillSelected) => {
    mainSkillSelected.setAttribute("src", "img/CadreSkill.png");
    mainSkillSelected.setAttribute("skillkey", "");
  });

  changeProgress(collapse, window.globalWeapon.filter((w) => w.key == weaponKey)[0].counter[0]);

  window.globalWeapon
    .filter((w) => w.key == weaponKey)[0]
    .skills.forEach(function (branch, indexbranch) {
      var weaponSide = indexbranch + 1;
      var branchNameId = `#branchName-${collapse}-${weaponSide}`;
      $q(branchNameId).innerText = option.getAttribute(`branch${weaponSide}`);

      //place les skills
      branch.forEach(function (row, indexrow) {
        row.forEach(function (skill) {
          var skillkey = skill.key;
          var skillDescription = window.skillsInfo[skillkey + "_description"];
          var idSkill = `#skill-${collapse}-${weaponSide}-${indexrow + 1}-${skill.col}`;
          var branchName = window.globalWeapon.filter((w) => w.key == weaponKey)[0].branchName[indexbranch];
          var imgPath = `img/${weaponKey}/${branchName}/${skillkey}.png`;
          var skillObject = $q(idSkill);
          skillObject.firstElementChild.src = imgPath;
          skillObject.setAttribute("weaponKey", weaponKey);
          skillObject.setAttribute("skill", skillkey);
          skillObject.setAttribute("collapse", collapse);
          skillObject.setAttribute("fill", true);
          Popover.getInstance(skillObject).enable();
          skillObject.setAttribute("data-bs-original-title", window.skillsInfo[skillkey]);
          skillObject.setAttribute("data-bs-content", skillDescription);
          greyscale(skillObject, skill.active);
          if (typeof skill.child == "object" && typeof skill.parent == "undefined") {
            var lisObject = $qa(`.mainskillli[collapse = "${collapse}"][li = "${li}"]`);
            lisObject.forEach((liObject) => {
              liObject.setAttribute("skillkey", skillkey);
              liObject.setAttribute("src", imgPath);
            });
            if (skill.active == true) {
              var isselected = false;
              window.globalWeapon
                .filter((w) => w.key == weaponKey)[0]
                .selectedMainSkills.forEach(function (SelectedSkill, index) {
                  if (SelectedSkill == skill.key && !isselected) {
                    $qa(`.mainSkillSelected[collapse="${collapse}"][cadre = "${index + 1}"]`).forEach((selectedMainSkill) => {
                      selectedMainSkill.setAttribute("src", imgPath);
                      selectedMainSkill.setAttribute("skillkey", skillkey);
                    });
                    $q(`.mainskillli[collapse="${collapse}"][cadre = "${index + 1}"][li = "7"]`).classList.remove("d-none");
                    isselected = true;
                  }
                });
              if (!isselected) {
                lisObject.forEach((liObject) => liObject.classList.remove("d-none"));
              }
            }
            li++;
          }
        });
      });
      //place les lignes sur le svg
      var bgSVG = $q(`#bgSvg-${collapse}-${indexbranch + 1}`);
      window.globalWeapon
        .filter((w) => w.key == weaponKey)[0]
        .lines[indexbranch].forEach((line) => {
          var coordinates = [];
          line.forEach(function (n, index) {
            if (index % 2 == 0) {
              coordinates.push((n * 100) / 5 - 10);
            } else {
              coordinates.push((n * 100) / 6 - 10);
            }
          });
          bgSVG.innerHTML += `<line class="skillLine" 
          x1="${coordinates[0]}%" y1="${coordinates[1]}%" 
          x2="${coordinates[2]}%" y2="${coordinates[3]}%"/>`
        });
      var svgContainer = $q(`#svgContainer-${collapse}-${indexbranch + 1}`);
      svgContainer.innerHTML = svgContainer.innerHTML;
    });
}

//au click d'un skill verifie si il est déja seclectionné, redirige vers la bonne fonction
$qa(".skill-container").forEach((skillObject) => {
  skillObject.addEventListener("click", function () {
    if (skillObject.getAttribute("fill") == "false") return;

    var skillkey = skillObject.getAttribute("skill");
    var side = skillObject.getAttribute("side");
    var weaponKey = skillObject.getAttribute("weaponKey");
    var collapse = skillObject.getAttribute("collapse");
    var row = skillObject.getAttribute("row");
    var weapon = window.globalWeapon.filter((w) => w.key == weaponKey)[0];
    var branchName = $q("#branchName-" + collapse + "-" + side).innerText;
    var branchSkill = weapon.skills[side - 1];
    var skill = branchSkill[row - 1].filter((s) => s.key == skillkey)[0];
    var counters = weapon.counter;

    //reset popover
    changePopover(skillObject, window.skillsInfo[skillkey + "_description"]);

    //Conditions pour allumer le skill //addskill(skillObject, weapon)
    if (skill.active == false) {
      //Si tous les point utiliser -> refuse
      if (counters[0] == 0) {
        changePopover(skillObject, window.messageSkill.NoMorePoint);
        return;
      }

      //Si premiere ligne -> allume
      if (row == 1) {
        addskill(skillObject, skill, weapon);
        return;
      }

      //Si skill dominant
      if (typeof skill.parent == "object") {
        var skillTocheck = [];
        //Extrait le skill parent
        branchSkill.slice(0, row).forEach((bottomRow) => {
          skill.parent.forEach((parentSkill) => {
            var toCkeck = bottomRow.filter((s) => s.key == parentSkill);
            if (toCkeck.length > 0 && toCkeck[0].active == false) {
              skillTocheck.push(toCkeck[0]);
            }
          });
        });
        //Si skill dominant inactive -> refuse
        if (skillTocheck.length > 0) {
          changePopover(skillObject, window.messageSkill.InlineSkillTop + window.skillsInfo[skillTocheck[0].key]);
          return;
        }
      }

      //Si skill ligne precedente active -> allume
      if (branchSkill[row - 2].filter((s) => s.active == true).length > 0) {
        //Si derniere ligne
        if (row == 6) {
          //Si moins de 10 points depense dans la branche -> refuse
          if (counters[side] < 10) {
            changePopover(skillObject, window.messageSkill.TenPointSelect + branchName);
            return;
          }
        }
        addskill(skillObject, skill, weapon);
        return;
      } else {
        changePopover(skillObject, window.messageSkill.Rowtop);
        return;
      }
    }
    //Conditions pour eteindre le skill // delSkill(skillObject, weapon)
    else {
      if (row == 6) {
        delSkill(skillObject, skill, weapon);
        return;
      }
      //Si skill derniere ligne active et point déeenser dans la branche = 11 -> refuser
      if (counters[side] == 11 && branchSkill[5].filter((s) => s.active == true).length > 0) {
        var lastSkillkey = branchSkill[5].filter((s) => s.active == true)[0];
        changePopover(skillObject, window.messageSkill.InlineSkillBottom + window.skillsInfo[lastSkillkey.key]);
        return;
      }

      //Si skill dominant
      if (typeof skill.child == "object") {
        var skillTocheck = [];
        //Extrait les skills enfants
        branchSkill.slice(row - 1, 6).forEach((bottomRow) => {
          skill.child.forEach((childskill) => {
            var toCkeck = bottomRow.filter((s) => s.key == childskill);
            if (toCkeck.length > 0 && toCkeck[0].active == true) {
              skillTocheck.push(toCkeck[0]);
            }
          });
        });
        //Si skill dependant active -> refuse
        if (skillTocheck.length > 0) {
          changePopover(skillObject, window.messageSkill.InlineSkillBottom + window.skillsInfo[skillTocheck[0].key]);
          return;
        }
      }

      //Si skills ligne suivante active et pas de skill meme ligne active -> refuse
      if (branchSkill[row].filter((s) => s.active == true).length > 0 && branchSkill[row - 1].filter((s) => s.active == true).length == 1) {
        changePopover(skillObject, window.messageSkill.RowBottom);
        return;
      }
      //Sinon -> allume
      else {
        delSkill(skillObject, skill, weapon);
        return;
      }
    }
  });
});

//fonction pour adjouter le skill
function addskill(skillObject, skill, weapon) {
  var collapse = skillObject.getAttribute("collapse");
  var side = skillObject.getAttribute("side");
  weapon.counter[0]--;
  weapon.counter[side]++;
  weapon.skills[side - 1][skillObject.getAttribute("row") - 1].filter((s) => s.key == skill.key)[0].active = true;
  changeProgress(collapse, weapon.counter[0]);
  greyscale(skillObject, true);
  if (typeof skill.child == "object" && typeof skill.parent == "undefined") {
    $qa(`.mainskillli[skillkey = "${skill.key}"]`).forEach((mainSkillLi) => mainSkillLi.classList.remove("d-none"));
  }
}

//fonction pour supprimer le skill
function delSkill(skillObject, skill, weapon) {
  var collapse = skillObject.getAttribute("collapse");
  var side = skillObject.getAttribute("side");
  weapon.counter[0]++;
  weapon.counter[side]--;
  weapon.skills[side - 1][skillObject.getAttribute("row") - 1].filter((s) => s.key == skill.key)[0].active = false;
  changeProgress(collapse, weapon.counter[0]);
  greyscale(skillObject, false);
  if (typeof skill.child == "object" && typeof skill.parent == "undefined") {
    $qa(`.mainskillli[skillkey = "${skill.key}"]`).forEach((mainskillli) => mainskillli.classList.add("d-none"));
    window.globalWeapon
      .filter((w) => w.key == weapon.key)[0]
      .selectedMainSkills.forEach(function (SelectedSkill, index) {
        if (SelectedSkill == skill.key) {
          $qa(`.mainSkillSelected[collapse="${collapse}"][cadre = "${index + 1}"]`).forEach((selectedMainSkill) => {
            selectedMainSkill.setAttribute("src", "img/CadreSkill.png");
            selectedMainSkill.setAttribute("skillkey", "");
          });
          $q(`.mainskillli[collapse="${collapse}"][cadre = "${index + 1}"][skillkey = ""]`).classList.add("d-none");
        }
      });
  }
}

//function au click d'un skill "main"
$qa(".mainskillli").forEach((mainSkillLi) => {
  mainSkillLi.addEventListener("click", function () {
    var collapse = mainSkillLi.getAttribute("collapse");
    var cadre = mainSkillLi.getAttribute("cadre");
    var src = mainSkillLi.getAttribute("src");
    var skillkey = mainSkillLi.getAttribute("skillkey");
    var selectedMainSkill = $q(`.mainSkillSelected[collapse="${collapse}"][cadre = "${cadre}"]`);
    var selectedSkillkey = selectedMainSkill.getAttribute("skillkey");

    //Si skill cliquer vide => cache son li de ce cadre || Sinon => cache son li de tous les cadre
    if (skillkey == "") $q(`.mainskillli[skillkey = "${skillkey}"][cadre = "${cadre}"]`).classList.add("d-none");
    else $qa(`.mainskillli[skillkey = "${skillkey}"]`).forEach((el) => el.classList.add("d-none"));

    //Si skill selected vide => montre son li de ce cadre || Sinon => montre son li dans tous les cadre
    if (selectedSkillkey == "") $q(`.mainskillli[skillkey = "${selectedSkillkey}"][cadre = "${cadre}"]`).classList.add("d-none");
    else $qa(`.mainskillli[skillkey = "${selectedSkillkey}"]`).forEach((el) => el.classList.add("d-none"));

    //Ajouter le skill selected à l'image afficher
    selectedMainSkill.setAttribute("src", src);
    selectedMainSkill.setAttribute("skillkey", skillkey);

    //Ajouter le skill selected à la variable weapon global
    window.globalWeapon.filter((w) => w.key == window.selectedWeapon[collapse - 1])[0].selectedMainSkills[cadre - 1] = skillkey;
  });
});

//fonction pour update les progresBar
function changeProgress(collapse, counter) {
  $q("#pointProgres" + collapse).style.width = (counter * 100) / 19 + "%";
  $q("#pointProgresText" + collapse).innerText = window.messageSkill.RemainingPoint + counter;
}

//Envoyer la build au serveur
var textErr = $q("#zoneErreur");
var form = $q("#BuildForm");
form.addEventListener("submit", function (e) {
  e.preventDefault();
  textErr.innerText = "";
  var buildObject = new Object();

  //Nom
  var name = $q("#BuildNameInput").value;
  if (name.length < 8) {
    textErr.innerText = "Le nom doit avoir plus de 8 caractere";
    return;
  }
  buildObject.name = name;

  //Type, si pas selectionné => 0 (All)
  buildObject.type = Object.values($q("#SelectType").children).filter((ch) => {
    if (ch.selected == true) return ch;
  })[0].value;

  //Description
  buildObject.description = $q("#DescriptionInput").value;

  //weapon
  if (window.selectedWeapon[0] == "" || window.selectedWeapon[1] == "") {
    textErr.innerText = "Vous devez sélectionnez au moins une arme";
    return;
  }
  buildObject.weapon = window.selectedWeapon;

  // window.globalWeapon.filter(w => w.key == window.selectedWeapon[0] || w.key == window.selectedWeapon[1])

  fetch("/submit", {
    method: "POST",
    body: JSON.stringify(buildObject),
  })
    .then((result) => result.json())
    .then((data) => {
      if (xhr.status === 201) {
        window.location.href = "/build/" + data["id"];
      }
    });
});

//fonction pour update les popover
function changePopover(skillObject, message) {
  skillObject.setAttribute("data-bs-content", message);
  Popover.getInstance(skillObject).show();
}

//fonction pour update les filtres gris
function greyscale(element, active) {
  if (!active) element.style.filter = "grayscale(1)";
  else element.style.filter = "";
}
