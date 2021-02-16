window.onload = function (){

//initialise les popovers
$(document).ready(function(){
  $('[data-toggle="popover"]').popover({
    html: true
  }); 
});

//reset les selects weapon
$('.selectChoixWeapon').prop('selectedIndex', 0);
$('.selectType').prop('selectedIndex', 0);

//recupere la lang envoyé par le php
var lang = $('html').attr('lang')

//initiale les variables global
var globalWeapon = []
var selectedWeapon = ["",""]

//fetch les traductions de competences
$.getJSON("json/"+lang+"/weaponabilities.json", function(skillsInfo){
$.getJSON("json/"+lang+"/messageSkill.json", function(messageSkill){

  //executé au click du choix d'armes
  $('.selectChoixWeapon').change(function(){

    var weaponCollapse = $(this).attr('weaponCollapse');
    var option = $(this).children(":selected");

    //verifie si deja selectionné, si oui break
    if(selectedWeapon[weaponCollapse-1] == option.attr('value')){return}
    selectedWeapon[weaponCollapse-1] = option.attr('value');

    //enleve l'arme du menu deroulant deja choisi dans l'autre menu deroulant
    if (weaponCollapse == 1) {var nweaponCollapseId = '.weaponCollapse'+2 } 
    else {var nweaponCollapseId = '.weaponCollapse'+1}
    $(nweaponCollapseId).css('display', 'block');
    $(nweaponCollapseId+"#"+option.attr('id')).css('display', 'none');
    
    //appelle fonction de remplissage et si collapse ouverte attend fin fermeture
    var toChange = true;
    var collapse = $('#collapse'+weaponCollapse)
    if(collapse.hasClass("show")){
        collapse.collapse("hide");
        collapse.on('hidden.bs.collapse', function(){ 
          if(toChange){modifyCollapse(option);} toChange = false;});
    } else {modifyCollapse(option); toChange = false;}

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
    var weaponCollapse = option.attr('weaponCollapse');
    var weaponName = option.html()
    var weaponKey = option.attr('value');

    //ajoute le nom de l'arme sur le button de collapse correspondant
    $('#buttonCollapse'+weaponCollapse).html(weaponName);
    
    //fait appraitre le body de la collapse et enleve le message "pas d'amre"
    $('.weaponAlert'+weaponCollapse).css('display', 'none');
    $('#weaponCollapse'+weaponCollapse).css('display', 'block');

    //reset complet
    $(".skill-container-img.collapse"+weaponCollapse).attr('src', 'img/emptyCadre.png');
    $(".skill-container.collapse"+weaponCollapse).css('background-image', 'url("")');
    $(".skill-container.collapse"+weaponCollapse).popover('disable')
    $(".skill-container.collapse"+weaponCollapse).attr('fill', 'false');
    $(".skill-container.collapse"+weaponCollapse).attr('alert', 'false')
    changeProgress(weaponCollapse, globalWeapon.filter(w => w.key == weaponKey)[0].counter[0])

    globalWeapon.filter(w => w.key == weaponKey)[0].skills.forEach(function (branch, indexbranch) {
      var weaponSide = indexbranch+1;
      var branchNameId = '#branchName-'+weaponCollapse+'-'+weaponSide;
      $(branchNameId).html(option.attr('branch'+weaponSide))

      //place les skills
      branch.forEach(function (row, indexrow) {
        row.forEach(function(skill) {
          var skillRow = indexrow+1;
          var skillKey = skill.key;
          var skillTitle = skillsInfo[skillKey];
          var skillDescription = skillsInfo[skillKey + '_description']
          var idSkill = '#skill-'+weaponCollapse+'-'+weaponSide+'-'+skillRow+'-'+skill.col;
          var imgPath = 'img/'+weaponKey+'/'+globalWeapon.filter(w => w.key == weaponKey)[0].branchName[indexbranch]+'/'+skillKey+'.png';
          var skillObject = $(idSkill);
          skillObject[0].firstChild.src = imgPath;
          skillObject.attr('weaponKey', weaponKey).attr('skill', skillKey).attr('weaponCollapse', weaponCollapse).attr('fill', true)
          skillObject.popover('enable').attr('data-bs-original-title', skillTitle).attr('data-bs-content', skillDescription)
          greyscale(skillObject, skill.active);
        })
      })

      //place les lignes
      globalWeapon.filter(w => w.key == weaponKey)[0].lines[indexbranch].forEach(line => {
        var idSkill = '#skill-'+weaponCollapse+'-'+weaponSide+'-'+line.row+'-'+line.col;
        $(idSkill).css('background-image', 'url("img/skillLine'+line.type+'.png")');
      })

    })
  }

  //au click d'un skill verifie si il est déja seclectionné, redirige vers la bonne fonction
  $('.skill-container').click(function(){

    var skillObject = $(this);
    if(skillObject.attr('fill') == 'false') {return}

    var skillkey = skillObject.attr('skill');
    var side = skillObject.attr('side');
    var weaponKey = skillObject.attr('weaponKey');
    var weaponcollapse = skillObject.attr('weaponcollapse');
    var row = skillObject.attr('row');
    var weapon = globalWeapon.filter(w => w.key == weaponKey)[0];
    var branchName = $('#branchName-'+weaponcollapse+'-'+side).html()
    var branchSkill = weapon.skills[side-1];
    var skill = branchSkill[row-1].filter(s => s.key == skillkey)[0];
    var col = skill.col;
    var lines = weapon.lines[side-1];
    var counters = weapon.counter;
    
    //reset popover
    changePopover($(this), skillsInfo[skillkey + '_description']);

    //Conditions pour allumer le skill //addskill(skillObject, weapon);
    if(skill.active == false){

      //Si tous les point utiliser -> refuse
      if(counters[0] == 0){changePopover(skillObject, messageSkill.NoMorePoint);return}

      //Si premiere ligne -> allume
      if(row == 1){addskill(skillObject,skill, weapon);return}

      //Si skill dependant
      if(lines.filter(l => l.col == col && l.row == row && (l.type == "Solid" || l.type == "Stop")).length > 0){
        var skillTocheck;
        branchSkill.slice(0, row-1).forEach(topRow =>{ // recupere les ligne suivantes
          var rowToCheck = topRow.filter(s => s.col == col)
          if(rowToCheck.length != 0){skillTocheck = rowToCheck[0]}
        })
        //Si skill dominant inactive -> refuse
        if(skillTocheck.active == false){ changePopover(skillObject, messageSkill.InlineSkillTop+skillsInfo[skillTocheck.key]); return}
      }

      //Si skill ligne precedente active -> allume
      if(branchSkill[row-2].filter(s => s.active == true).length > 0){
        //Si derniere ligne
        if(row == 6){ //Si moins de 10 points depense dans la branche -> refuse
          if(counters[side] < 10){changePopover(skillObject, messageSkill.TenPointSelect+branchName); return} } 
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
      if(lines.filter(l => l.col == col && l.row == row && (l.type == "Start" || l.type == "Solid")).length > 0){
        var skillTocheck = [];
        branchSkill.slice(row, 6).forEach(bottomRow =>{ // recupere le skill dominant
          var rowToCheck = bottomRow.filter(s => s.col == col)
          if(rowToCheck.length != 0) {skillTocheck.push(rowToCheck[0])}
        })
        //Si skill dependant active -> refuse
        if(skillTocheck[0].active == true){ changePopover(skillObject, messageSkill.InlineSkillTop+skillsInfo[skillTocheck[0].key]); return}
      }

      //Si skills ligne suivante active et pas de skill meme ligne active -> refuse
      if(branchSkill[row].filter(s => s.active == true).length > 0 && branchSkill[row-1].filter(s => s.active == true).length == 1)
      {
        changePopover(skillObject, messageSkill.RowBottom); 
        return
      }
      //Sinon -> allume
      else{
        delSkill(skillObject,skill, weapon);return}
    }
  })

  //fonction pour adjouter le skill
  function addskill(skillObject,skill, weapon){
    var matchStartLine = globalWeapon.filter(w => w.key == weapon.key)[0].lines[skillObject.attr('side')-1].filter(l => l.col == skill.col && l.row == skillObject.attr('row') && l.type == "Start");
    if(matchStartLine.length > 0){
      weapon.selectedMainSkills.push(skill.key)
    }
    var skillkey = skillObject.attr('skill')
    weapon.counter[0]--; 
    weapon.counter[skillObject.attr('side')]++;
    weapon.skills[skillObject.attr('side')-1][skillObject.attr('row')-1].filter(s => s.key == skillkey)[0].active = true;
    changeProgress(skillObject.attr('weaponCollapse'), weapon.counter[0])
    greyscale(skillObject, true)
  }

  //fonction pour supprimer le skill
  function delSkill(skillObject,skill, weapon){
    var matchStartLine = globalWeapon.filter(w => w.key == weapon.key)[0].lines[skillObject.attr('side')-1].filter(l => l.col == skill.col && l.row == skillObject.attr('row') && l.type == "Start");
    var skillkey = skillObject.attr('skill')
    weapon.counter[0]++; 
    weapon.counter[skillObject.attr('side')]--;
    weapon.skills[skillObject.attr('side')-1][skillObject.attr('row')-1].filter(s => s.key == skillkey)[0].active = false;
    changeProgress(skillObject.attr('weaponCollapse'), weapon.counter[0])
    greyscale(skillObject, false)
  }

  //fonction pour update les popover
  function changePopover(skillObject, message){
      skillObject.attr('data-bs-content',message)
      skillObject.popover('show')
  }

  //fonction pour update les progresBar
  function changeProgress(weaponCollapse, counter){
    $('#pointProgres'+weaponCollapse).css('width', (counter*100/19)+'%')
    $('#pointProgresText'+weaponCollapse).html(messageSkill.RemainingPoint + counter)
  }

  //fonction pour update les filtres gris
  function greyscale(element, active){
    if(!active){
      element.css('filter', 'grayscale(1)');
      element.css('-webkit-filter:', 'grayscale(1)');
    }else{
      element.css('filter', '');
      element.css('-webkit-filter:', '');
    }
  }

  $('#showResult').click(function(){
    console.log(globalWeapon);
    console.log(globalWeapon.filter(w => w.key == selectedWeapon[0] || w.key == selectedWeapon[1]));
  })

});
});

}
