// fetch les traductions
$.getJSON(`json/${lang}/weaponabilities.json`, function(result){ skillsInfo = result })
$.getJSON(`json/${lang}/messageSkill.json`, function(result){ messageSkill = result })

//initialise les variables globales
var weaponObject = $('#WeaponDataContainer').attr('data-weapon')
if (!weaponObject){
  globalWeapon = []
  selectedWeapon  = ["",""]
  $('.selectChoixWeapon').prop('selectedIndex', 0)
  $('#SelectType').prop('selectedIndex', 0)
}else{
  //TODO remplir les chnat en fonction des données récupéré (/edit/{id})
}

//executé au click du choix d'armes
$('.selectChoixWeapon').change(function(){

  var collapse = $(this).attr('collapse')
  var option = $(this).children(':selected')

  //verifie si deja selectionné, si oui break
  if(selectedWeapon[collapse-1] == option.attr('value')) return
  selectedWeapon[collapse-1] = option.attr('value')

  //enleve l'arme du menu deroulant deja choisi dans l'autre menu deroulant
  var negCollapse = `[collapse = "${Math.abs(collapse-3)}"]`
  $(`.optionChoixWeapon${negCollapse}`).css('display', 'block')
  $(`.optionChoixWeapon${negCollapse}[value = "${option.attr('value')}"]`).css('display', 'none')
  
  //appelle fonction de remplissage et si collapse ouverte attend fin fermeture
  var toChange = true
  var collapseObject = $(`#collapse-${collapse}`)
  if(collapseObject.hasClass('show')){
    collapseObject.collapse('hide')
    collapseObject.on('hidden.bs.collapse', function(){ 
        if(toChange) modifyCollapse(option)
        toChange = false
    })
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
      $.getJSON(`json/${option.attr('value')}.json`, function(weaponInfo){
        globalWeapon.push(weaponInfo)
        setupWeapon(option)
      })
    }
    else setupWeapon(option)
}

//place les images en gris, les lignes, les titres de branche et les popovers
function setupWeapon(option){
  //initiale les variables
  var option  
  var collapse = option.attr('collapse')
  var weaponName = option.html()
  var weaponKey = option.attr('value')
  var li = 1

  //ajoute le nom de l'arme sur le button de collapse correspondant
  $(`#buttonCollapse-${collapse}`).html(weaponName)
  
  //fait appraitre le body de la collapse et enleve le message "pas d'amre"
  $(`.collapseAlert[collapse = ${collapse}]`).css('display', 'none')
  $(`#weaponCollapse-${collapse}`).css('display', 'block')

  //reset complet
  $(`.bgSvg[collapse = ${collapse}]`).children().remove()
  $(`.skill-container[collapse = "${collapse}"]`).attr('fill', 'false').attr('alert', 'false').popover('disable')
  $(`.skill-container-img[collapse = "${collapse}"]`).attr('src', 'img/emptyCadre.png')
  $(`.mainskillli[collapse = "${collapse}"]`).attr('src', 'img/CadreSkill.png').attr('skillkey', '').addClass('d-none')
  $(`.mainSkillSelected[collapse = "${collapse}"]`).attr('src', 'img/CadreSkill.png').attr('skillkey', '')

  
  changeProgress(collapse, globalWeapon.filter(w => w.key == weaponKey)[0].counter[0])

  globalWeapon.filter(w => w.key == weaponKey)[0].skills.forEach(function (branch, indexbranch) {
    var weaponSide = indexbranch+1
    var branchNameId = `#branchName-${collapse}-${weaponSide}`
    $(branchNameId).html(option.attr(`branch${weaponSide}`))

    //place les skills
    branch.forEach(function (row, indexrow) {
      row.forEach(function(skill) {
        var skillkey = skill.key
        var skillDescription = skillsInfo[skillkey + '_description']
        var idSkill = '#skill-'+collapse+'-'+weaponSide+'-'+(indexrow+1)+'-'+skill.col
        var imgPath = 'img/'+weaponKey+'/'+globalWeapon.filter(w => w.key == weaponKey)[0].branchName[indexbranch]+'/'+skillkey+'.png'
        var skillObject = $(idSkill)
        skillObject[0].firstElementChild.src = imgPath
        skillObject.attr('weaponKey', weaponKey).attr('skill', skillkey).attr('collapse', collapse).attr('fill', true)
        skillObject.popover('enable').attr('data-bs-original-title', skillsInfo[skillkey]).attr('data-bs-content', skillDescription)
        greyscale(skillObject, skill.active)
        if(typeof skill.child == 'object' && typeof skill.parent == 'undefined'){
          var lis = $(`.mainskillli[collapse = "${collapse}"][li = "${li}"]`)
          lis.attr('skillkey', skillkey)
          lis.attr('src', imgPath)
          if(skill.active == true){
            var isselected = false
            globalWeapon.filter(w => w.key == weaponKey)[0].selectedMainSkills.forEach(function(SelectedSkill, index){
              if (SelectedSkill == skill.key && !isselected) {        
                var selectedMainSkill = $(`.mainSkillSelected[collapse="${collapse}"][cadre = "${index+1}"]`)
                selectedMainSkill.attr('src', imgPath)
                selectedMainSkill.attr('skillkey', skillkey)
                $(`.mainskillli[collapse="${collapse}"][cadre = "${index+1}"][li = "7"]`).removeClass('d-none')
                isselected = true
              }
            })
            if(!isselected){
              console.log(skill.key);
              lis.removeClass('d-none')
            }
          }
          li++
        }
      })
    })
    //place les lignes sur le svg
    var bgSVG = $(`#bgSvg-${collapse}-${(indexbranch+1)}`)
    globalWeapon.filter(w => w.key == weaponKey)[0].lines[indexbranch].forEach(line => {
      var coordinates = []
      line.forEach(function(n, index){
        if(index % 2 == 0){ coordinates.push(n*100/5-10) }
        else{ coordinates.push(n*100/6-10) }
      })
      bgSVG.append('<line class="skillLine" x1="'+coordinates[0]+'%" y1="'+coordinates[1]+'%" x2="'+coordinates[2]+'%" y2="'+coordinates[3]+'%"/>')
    })
    var svgContainer = $(`#svgContainer-${collapse}-${indexbranch+1}`)
    svgContainer.html(svgContainer.html())
  })
}


//au click d'un skill verifie si il est déja seclectionné, redirige vers la bonne fonction
$('.skill-container').click(function(){

  var skillObject = $(this)
  if(skillObject.attr('fill') == 'false') {return}

  var skillkey = skillObject.attr('skill')
  var side = skillObject.attr('side')
  var weaponKey = skillObject.attr('weaponKey')
  var collapse = skillObject.attr('collapse')
  var row = skillObject.attr('row')
  var weapon = globalWeapon.filter(w => w.key == weaponKey)[0]
  var branchName = $('#branchName-'+collapse+'-'+side).html()
  var branchSkill = weapon.skills[side-1]
  var skill = branchSkill[row-1].filter(s => s.key == skillkey)[0]
  var counters = weapon.counter
  
  //reset popover
  changePopover($(this), skillsInfo[skillkey + '_description'])

  //Conditions pour allumer le skill //addskill(skillObject, weapon)
  if(skill.active == false){
    
    //Si tous les point utiliser -> refuse
    if(counters[0] == 0){
      changePopover(skillObject, messageSkill.NoMorePoint)
      return
    }

    //Si premiere ligne -> allume
    if(row == 1){
      addskill(skillObject,skill, weapon)
      return
    }

    //Si skill dominant
    if(typeof skill.parent == 'object'){
      var skillTocheck = []
      //Extrait le skill parent
      branchSkill.slice(0, row).forEach(bottomRow =>{
        skill.parent.forEach(parentSkill => {
          var toCkeck = bottomRow.filter(s => s.key == parentSkill)
          if(toCkeck.length > 0 && toCkeck[0].active == false){
            skillTocheck.push(toCkeck[0])
          }
        })
      })
      //Si skill dominant inactive -> refuse
      if(skillTocheck.length > 0){ 
        changePopover(skillObject, messageSkill.InlineSkillTop+skillsInfo[skillTocheck[0].key]) 
        return
      }
    }

    //Si skill ligne precedente active -> allume
    if(branchSkill[row-2].filter(s => s.active == true).length > 0){
      //Si derniere ligne
      if(row == 6){ //Si moins de 10 points depense dans la branche -> refuse
        if(counters[side] < 10){
          changePopover(skillObject, messageSkill.TenPointSelect+branchName) 
          return
        } 
      } 
      addskill(skillObject,skill, weapon)
      return
    }
    else{ 
      changePopover(skillObject, messageSkill.Rowtop)
      return
    } 

  }
  //Conditions pour eteindre le skill // delSkill(skillObject, weapon)
  else{ 
    
    if(row == 6){
      delSkill(skillObject,skill, weapon) 
      return
    }
    //Si skill derniere ligne active et point déeenser dans la branche = 11 -> refuser
    if(counters[side] == 11 && branchSkill[5].filter(s => s.active == true).length > 0){
      var lastSkillkey = branchSkill[5].filter(s => s.active == true)[0]
      changePopover(skillObject, messageSkill.InlineSkillBottom+skillsInfo[lastSkillkey.key])
      return
    }

    //Si skill dominant
    if(typeof skill.child == 'object'){
      var skillTocheck = []
      //Extrait les skills enfants
      branchSkill.slice(row-1, 6).forEach(bottomRow =>{
        skill.child.forEach(childskill => {
          var toCkeck = bottomRow.filter(s => s.key == childskill)
          if(toCkeck.length > 0 && toCkeck[0].active == true){
            skillTocheck.push(toCkeck[0])
          }
        })
      })
      //Si skill dependant active -> refuse
      if(skillTocheck.length > 0){ 
        changePopover(skillObject, messageSkill.InlineSkillBottom+skillsInfo[skillTocheck[0].key]) 
        return
      }
    }

    //Si skills ligne suivante active et pas de skill meme ligne active -> refuse
    if(branchSkill[row].filter(s => s.active == true).length > 0 && branchSkill[row-1].filter(s => s.active == true).length == 1){
      changePopover(skillObject, messageSkill.RowBottom)
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
  var collapse = skillObject.attr('collapse')
  var side = skillObject.attr('side')
  weapon.counter[0]-- 
  weapon.counter[side]++
  weapon.skills[side-1][skillObject.attr('row')-1].filter(s => s.key == skill.key)[0].active = true
  changeProgress(collapse, weapon.counter[0])
  greyscale(skillObject, true)
  if(typeof skill.child == 'object' && typeof skill.parent == 'undefined'){
    $(`.mainskillli[skillkey = "${skill.key}"]`).removeClass('d-none')
  }
}

//fonction pour supprimer le skill
function delSkill(skillObject,skill, weapon){
  var collapse = skillObject.attr('collapse')
  var side = skillObject.attr('side')
  weapon.counter[0]++ 
  weapon.counter[side]--
  weapon.skills[side-1][skillObject.attr('row')-1].filter(s => s.key == skill.key)[0].active = false
  changeProgress(collapse, weapon.counter[0])
  greyscale(skillObject, false)
  if(typeof skill.child == 'object' && typeof skill.parent == 'undefined'){
    $(`.mainskillli[skillkey = "${skill.key}"]`).addClass('d-none')
    globalWeapon.filter(w => w.key == weapon.key)[0].selectedMainSkills.forEach(function(SelectedSkill, index){
      if (SelectedSkill == skill.key) {        
        var selectedMainSkill = $(`.mainSkillSelected[collapse="${collapse}"][cadre = "${index+1}"]`)
        selectedMainSkill.attr('src', 'img/CadreSkill.png')
        selectedMainSkill.attr('skillkey', '')
        $(`.mainskillli[collapse="${collapse}"][cadre = "${index+1}"][skillkey = ""]`).addClass('d-none')
        SelectedSkill = ""
      }
    })
  }
}

//function au click d'un skill "main"
$('.mainskillli').click(function(){
  var collapse = $(this).attr('collapse')
  var cadre = $(this).attr('cadre')
  var src = $(this).attr('src')
  var skillkey = $(this).attr('skillkey')
  var selectedMainSkill = $(`.mainSkillSelected[collapse="${collapse}"][cadre = "${cadre}"]`)
  var selectedSkillkey = selectedMainSkill.attr('skillkey')

  //Si skill cliquer vide => cache son li de ce cadre || Sinon => cache son li de tous les cadre
  if(skillkey == "") $(`.mainskillli[skillkey = "${skillkey}"][cadre = "${cadre}"]`).addClass('d-none')
  else $(`.mainskillli[skillkey = "${skillkey}"]`).addClass('d-none')
  
  //Si skill selected vide => montre son li de ce cadre || Sinon => montre son li dans tous les cadre
  if(selectedSkillkey == "") $(`.mainskillli[skillkey = "${selectedSkillkey}"][cadre = "${cadre}"]`).removeClass('d-none')
  else $(`.mainskillli[skillkey = "${selectedSkillkey}"]`).removeClass('d-none')
  
  //Ajouter le skill selected à l'image afficher
  selectedMainSkill.attr('src', src)
  selectedMainSkill.attr('skillkey', skillkey)

  //Ajouter le skill selected à la variable weapon global
  globalWeapon.filter(w => w.key == selectedWeapon[collapse-1])[0].selectedMainSkills[cadre-1] = skillkey
})

//fonction pour update les progresBar
function changeProgress(collapse, counter){
  $('#pointProgres'+collapse).css('width', (counter*100/19)+'%')
  $('#pointProgresText'+collapse).html(messageSkill.RemainingPoint + counter)
}

//Envoyer la build au serveur
var textErr = $('#zoneErreur')
var form = $("#BuildForm")
form.submit(function(e) {

  e.preventDefault()
  textErr.text("")
  var buildObject = new Object

  //Nom
  var name = $('#BuildNameInput').val()
  if(name.length < 8){
    textErr.text("Le nom doit avoir plus de 8 caractere")
    return}
  buildObject.name = name

  //Type, si pas selectionné => 0 (All)
  buildObject.type = $('#SelectType').children(":selected").val()

  //Description
  buildObject.description = $('#DescriptionInput').val()

  //weapon
  if(selectedWeapon[0] == "" || selectedWeapon[1] == ""){
    textErr.text("Vous devez sélectionnez 2 arme")
    return
  }
  buildObject.weapon = selectedWeapon
  
  // globalWeapon.filter(w => w.key == selectedWeapon[0] || w.key == selectedWeapon[1])

  console.log(buildObject)
  
  $.post('submit', JSON.stringify(buildObject), function(data, textStatus, xhr){
    if(xhr.status === 201){
      window.location.href="/build/"+data['id']
    }
  })

})