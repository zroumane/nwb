// fetch les traductions
$.getJSON(`json/${lang}/weaponabilities.json`, function(result){ skillsInfo = result; })
$.getJSON(`json/${lang}/messageSkill.json`, function(result){ messageSkill = result; })

//initialise les variables globales
var weaponObject = $('#WeaponDataContainer').attr('data-weapon')
if (!weaponObject){
  globalWeapon = []
  selectedWeapon  = ["",""]
    $('.selectChoixWeapon').prop('selectedIndex', 0);
    $('#SelectType').prop('selectedIndex', 0);
}else{
  //TODO remplir les chnat en fonction des données récupéré (/edit/{id})
}

//executé au click du choix d'armes
$('.selectChoixWeapon').change(function(){

  var collapse = $(this).attr('collapse')
  var option = $(this).children(":selected")

  //verifie si deja selectionné, si oui break
  if(selectedWeapon[collapse-1] == option.attr('value')) return
  selectedWeapon[collapse-1] = option.attr('value')

  //enleve l'arme du menu deroulant deja choisi dans l'autre menu deroulant
  var negCollapse = `[collapse = "${Math.abs(collapse-3)}"]`
  $(`.optionChoixWeapon${negCollapse}`).css('display', 'block')
  $(`.optionChoixWeapon${negCollapse}[value = "${option.attr('value')}"]`).css('display', 'none')
  
  //appelle fonction de remplissage et si collapse ouverte attend fin fermeture
  var toChange = true;
  var collapseObject = $('#collapse'+collapse)
  if(collapseObject.hasClass("show")){
    collapseObject.collapse("hide")
    collapseObject.on('hidden.bs.collapse', function(){ 
        if(toChange) modifyCollapse(option)
        toChange = false
    });
  }else{
    modifyCollapse(option) 
    toChange = false
  }

})

//Reset skill
$('.resetButton').click(function(){
  var collapse = $(this).attr('collapse')
  var option = $(`.optionChoixWeapon[collapse = "${collapse}"][value = "${selectedWeapon[collapse-1]}"]`)
  globalWeapon.splice(globalWeapon.indexOf(globalWeapon.filter(w => w.key == option.attr('value'))[0]), 1)
  modifyCollapse(option)
})

//fonction de vidage puis remplissage des collapses en fonction de l'arme
function modifyCollapse(option){
  
  //lance le setup de l'arme apres avoir verifier si deja presente dans les donners, sinon ajout
    if(globalWeapon.filter(w => w.key == option.attr('value')).length == 0){
      $.getJSON("json/"+option.attr('value')+".json", function(weaponInfo){
        globalWeapon.push(weaponInfo)
        setupWeapon(option); 
      })
    }
    else{ setupWeapon(option); }
}

//place les images en gris, les lignes, les titres de branche et les popovers
function setupWeapon(option){
  //initiale les variables
  var option  
  var collapse = option.attr('collapse')
  var weaponName = option.html()
  var weaponKey = option.attr('value')

  //ajoute le nom de l'arme sur le button de collapse correspondant
  $('#buttonCollapse'+collapse).html(weaponName)
  
  //fait appraitre le body de la collapse et enleve le message "pas d'amre"
  $('.collapseAlert'+collapse).css('display', 'none')
  $('#weaponCollapse-'+collapse).css('display', 'block')

  //reset complet
  $(`.bgSvg.collapse${collapse}`).children().remove();
  $(`.skill-container[collapse = "${collapse}"]`).attr('fill', 'false').attr('alert', 'false').popover('disable')
  $(`.skill-container-img[collapse = "${collapse}"]`).attr('src', 'img/emptyCadre.png')
  $(`.ulMainSkill[collapse = "${collapse}"]`).children().remove()
  $(`.mainSkillSelected[collapse = "${collapse}"]`).attr('src', 'img/CadreSkill.png').attr('skillKey', '')

  
  changeProgress(collapse, globalWeapon.filter(w => w.key == weaponKey)[0].counter[0])

  globalWeapon.filter(w => w.key == weaponKey)[0].skills.forEach(function (branch, indexbranch) {
    var weaponSide = indexbranch+1;
    var branchNameId = '#branchName-'+collapse+'-'+weaponSide;
    $(branchNameId).html(option.attr('branch'+weaponSide))

    //place les skills
    branch.forEach(function (row, indexrow) {
      row.forEach(function(skill) {
        var skillKey = skill.key;
        var skillDescription = skillsInfo[skillKey + '_description']
        var idSkill = '#skill-'+collapse+'-'+weaponSide+'-'+(indexrow+1)+'-'+skill.col;
        var imgPath = 'img/'+weaponKey+'/'+globalWeapon.filter(w => w.key == weaponKey)[0].branchName[indexbranch]+'/'+skillKey+'.png';
        var skillObject = $(idSkill);
        skillObject[0].firstElementChild.src = imgPath;
        skillObject.attr('weaponKey', weaponKey).attr('skill', skillKey).attr('collapse', collapse).attr('fill', true)
        skillObject.popover('enable').attr('data-bs-original-title', skillsInfo[skillKey]).attr('data-bs-content', skillDescription)
        greyscale(skillObject, skill.active);
        if(typeof skill.child == 'object' && typeof skill.parent == 'undefined' && skill.active == true){
          var isSelected = false;
          globalWeapon.filter(w => w.key == weaponKey)[0].selectedMainSkills.forEach(function(mainSkill, index){
            if(mainSkill == skillKey){
              var selected = $(`#mainSkillSelected-${collapse}-${index+1}`)
              selected.attr('src', imgPath)
              selected.attr('skillKey', skillKey)
              isSelected = true;
              var ul = $(`#ulMainSkill-${collapse}-${index+1}`)
              ul.append(`<li class="w-100"><img collapse="${collapse}" cadre="${index+1}" skillKey="" class="mainskillli dropdown-item p-0" src="img/CadreSkill.png"/></li>`)
              addClickEvent(collapse, index+1)
            }
          });
          if(!isSelected){
            for (let i = 1; i <= 3; i++) {
              var ul = $(`#ulMainSkill-${collapse}-${i}`)
              ul.append(`<li class="w-100"><img collapse="${collapse}" cadre="${i}" skillKey="${skillKey}" class="mainskillli dropdown-item p-0" src="${imgPath}"/></li>`)
              addClickEvent(collapse, i)
            }        
          }
        }
      })
    })
    //place les lignes sur le svg
    var bgSVG = $(`#bgSvg-${collapse}-${(indexbranch+1)}`);
    globalWeapon.filter(w => w.key == weaponKey)[0].lines[indexbranch].forEach(line => {
      var coordinates = []
      line.forEach(function(n, index){
        if(index % 2 == 0){ coordinates.push(n*100/5-10) }
        else{ coordinates.push(n*100/6-10) }
      })
      bgSVG.append('<line class="skillLine" x1="'+coordinates[0]+'%" y1="'+coordinates[1]+'%" x2="'+coordinates[2]+'%" y2="'+coordinates[3]+'%"/>')
    })
    var svgContainer = $(".svgContainer.svgSide"+(indexbranch+1)+'.collapse'+collapse)
    svgContainer.html(svgContainer.html());
  })
}


//au click d'un skill verifie si il est déja seclectionné, redirige vers la bonne fonction
$('.skill-container').click(function(){

  var skillObject = $(this);
  if(skillObject.attr('fill') == 'false') {return}

  var skillkey = skillObject.attr('skill');
  var side = skillObject.attr('side');
  var weaponKey = skillObject.attr('weaponKey');
  var collapse = skillObject.attr('collapse');
  var row = skillObject.attr('row');
  var weapon = globalWeapon.filter(w => w.key == weaponKey)[0];
  var branchName = $('#branchName-'+collapse+'-'+side).html()
  var branchSkill = weapon.skills[side-1];
  var skill = branchSkill[row-1].filter(s => s.key == skillkey)[0];
  var counters = weapon.counter;
  
  //reset popover
  changePopover($(this), skillsInfo[skillkey + '_description']);

  //Conditions pour allumer le skill //addskill(skillObject, weapon);
  if(skill.active == false){
    //Si tous les point utiliser -> refuse
    if(counters[0] == 0){changePopover(skillObject, messageSkill.NoMorePoint);return}

    //Si premiere ligne -> allume
    if(row == 1){addskill(skillObject,skill, weapon);return}

        //Si skill dominant
        if(typeof skill.parent == 'object'){
          var skillTocheck = [];
          //Extrait le skill parent
          branchSkill.slice(0, row).forEach(bottomRow =>{
            skill.parent.forEach(parentSkill => {
              var toCkeck = bottomRow.filter(s => s.key == parentSkill);
              if(toCkeck.length > 0 && toCkeck[0].active == false){
                skillTocheck.push(toCkeck[0])
              }
            });
          })
          //Si skill dominant inactive -> refuse
          if(skillTocheck.length > 0){ changePopover(skillObject, messageSkill.InlineSkillTop+skillsInfo[skillTocheck[0].key]); return}
        }

    //Si skill ligne precedente active -> allume
    if(branchSkill[row-2].filter(s => s.active == true).length > 0){
      //Si derniere ligne
      if(row == 6){ //Si moins de 10 points depense dans la branche -> refuse
        if(counters[side] < 10){changePopover(skillObject, messageSkill.TenPointSelect+branchName); return} 
      } 
      addskill(skillObject,skill, weapon);return}
      else{ changePopover(skillObject, messageSkill.Rowtop); return} 

  }
  //Conditions pour eteindre le skill // delSkill(skillObject, weapon);
  else{ 
    
    if(row == 6){delSkill(skillObject,skill, weapon); return}
    //Si skill derniere ligne active et point déeenser dans la branche = 11 -> refuser
    if(counters[side] == 11 && branchSkill[5].filter(s => s.active == true).length > 0){
      var lastSkillkey = branchSkill[5].filter(s => s.active == true)[0]
      changePopover(skillObject, messageSkill.InlineSkillBottom+skillsInfo[lastSkillkey.key]);
      return
    }

    //Si skill dominant
    if(typeof skill.child == 'object'){
      var skillTocheck = [];
      //Extrait les skills enfants
      branchSkill.slice(row-1, 6).forEach(bottomRow =>{
        skill.child.forEach(childskill => {
          var toCkeck = bottomRow.filter(s => s.key == childskill);
          if(toCkeck.length > 0 && toCkeck[0].active == true){
            skillTocheck.push(toCkeck[0])
          }
        });
      })
      //Si skill dependant active -> refuse
      if(skillTocheck.length > 0){ changePopover(skillObject, messageSkill.InlineSkillBottom+skillsInfo[skillTocheck[0].key]); return}
    }

    //Si skills ligne suivante active et pas de skill meme ligne active -> refuse
    if(branchSkill[row].filter(s => s.active == true).length > 0 && branchSkill[row-1].filter(s => s.active == true).length == 1){
      changePopover(skillObject, messageSkill.RowBottom); 
      return
    }
    //Sinon -> allume
    else{
      delSkill(skillObject,skill, weapon)
      return
    }
  }
})

//fonction pour adjouter le skill
function addskill(skillObject, skill, weapon){
  if(typeof skill.child == 'object' && typeof skill.parent == 'undefined'){
    var collapse = skillObject.attr('collapse')
    var side = weapon.branchName[skillObject.attr('side')-1];
    for (let i = 1; i <= 3; i++) {
      var ul = $(`#ulMainSkill-${collapse}-${i}`)
      ul.append(`<li class="w-100"><img collapse="${collapse}" cadre="${i}" skillKey="${skill.key}" class="mainskillli dropdown-item p-0" src="img/${weapon.key}/${side}/${skill.key}.png"/></li>`)
      addClickEvent(collapse, i)
    }
  }
  var skillkey = skillObject.attr('skill')
  weapon.counter[0]--; 
  weapon.counter[skillObject.attr('side')]++;
  weapon.skills[skillObject.attr('side')-1][skillObject.attr('row')-1].filter(s => s.key == skillkey)[0].active = true;
  changeProgress(skillObject.attr('collapse'), weapon.counter[0])
  greyscale(skillObject, true)
}


//fonction pour supprimer le skill
function delSkill(skillObject,skill, weapon){
  if(typeof skill.child == 'object' && typeof skill.parent == 'undefined'){
    var collapse = skillObject.attr('collapse')
    var side = weapon.branchName[skillObject.attr('side')-1];
    $(`.mainskillli[skillKey="${skill.key}"]`).parent().remove()
    var selected = $(`.mainSkillSelected[skillKey="${skill.key}"]`)
    if(selected.length > 0){
      var liBlank = $(`.mainskillli[skillKey=""][collapse="${collapse}"][cadre="${selected.attr('cadre')}"]`)
      console.log(liBlank);
      selected.attr('src', liBlank.attr('src'))
      selected.attr('skillKey', liBlank.attr('skillKey'))
      liBlank.parent().remove()
    }
    var index = globalWeapon.filter(w => w.key == selectedWeapon[collapse-1])[0].selectedMainSkills.indexOf(skill.key)
    globalWeapon.filter(w => w.key == selectedWeapon[collapse-1])[0].selectedMainSkills[index] = "";
  }
  var skillkey = skillObject.attr('skill')
  weapon.counter[0]++; 
  weapon.counter[skillObject.attr('side')]--;
  weapon.skills[skillObject.attr('side')-1][skillObject.attr('row')-1].filter(s => s.key == skillkey)[0].active = false;
  changeProgress(skillObject.attr('collapse'), weapon.counter[0])
  greyscale(skillObject, false)
}

//Ajoute la fonction de click sur un skill carré dans la sélection
function addClickEvent(collapse, i){
  $(`.mainskillli[collapse="${collapse}"][cadre="${i}"]`).unbind('click').click(function(){
    var src = $(this).attr('src')
    var skillKey = $(this).attr('skillKey');
    var selected = $(`#mainSkillSelected-${collapse}-${i}`)
    var srcSelected = selected.attr('src')
    var skillKeySelected = selected.attr('skillKey')
    selected.attr('src', src)
    selected.attr('skillKey', skillKey)
    $(this).attr('src', srcSelected)
    $(this).attr('skillKey', skillKeySelected)
    globalWeapon.filter(w => w.key == selectedWeapon[collapse-1])[0].selectedMainSkills[i-1] = skillKey;
    if (skillKey !== "") { $(`.mainskillli[skillKey="${skillKey}"]`).parent().remove()}
    if (skillKeySelected != "") {
      for (let c = 1; c <= 3; c++) {
        if(c !== i){ 
          var ul = $(`#ulMainSkill-${collapse}-${c}`)
          ul.append(`<li class="w-100"><img collapse="${collapse}" cadre="${c}" skillKey="${skillKeySelected}" class="mainskillli dropdown-item p-0" src="${srcSelected}"/></li>`)
          addClickEvent(collapse, c)
        }
      }
    }
  })
}

//fonction pour update les progresBar
function changeProgress(collapse, counter){
  $('#pointProgres'+collapse).css('width', (counter*100/19)+'%')
  $('#pointProgresText'+collapse).html(messageSkill.RemainingPoint + counter)
}

//Envoyer la build au serveur
var textErr = $('#zoneErreur')
var form = $("#BuildForm")

form.submit(function(e) {

  e.preventDefault();
  textErr.text("")

  var buildObject = new Object;

  var title = $('#BuildNameInput').val()
  if(title.length < 8){
    textErr.text("Le nom doit avoir plus de 8 caractere")
    return;
  }
  buildObject.title = $('#BuildNameInput').val();

  if($('#SelectType').children(":selected").val() == 0){
    textErr.text("Vous devez sélectionnez un type")
    return;
  }
  buildObject.type = $('#SelectType').children(":selected").val();

  buildObject.description = $('#DescriptionInput').val();


  if(selectedWeapon[0] == "" || selectedWeapon[1] == ""){
    textErr.text("Vous devez sélectionnez 2 arme")
    return;
  }
  
  // buildObject.weapon = globalWeapon.filter(w => w.key == selectedWeapon[0] || w.key == selectedWeapon[1]);

  // console.log(buildObject);
  
  $.post('submit', JSON.stringify(buildObject), function(data, textStatus, xhr){
    if(xhr.status === 201){
      window.location.href="/build/"+data['id'];
    }
  })

});