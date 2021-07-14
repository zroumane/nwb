<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class MainSkillValidator extends ConstraintValidator
{

  public function validate($mainSkills, Constraint $constraint)
  {
    $activeSkill = $this->context->getObject()->getActiveSkills();
    
    foreach($mainSkills as $weaponIndex => $weaponMainSkill) {
      $weaponActiveSkill = $activeSkill[$weaponIndex];
      if(count($weaponMainSkill) != 3){
        $this->context->buildViolation($constraint->messageLenght)->addViolation();
      }
      foreach ($weaponMainSkill as $key => $mainSkill) {
        dd($mainSkill->getType());
        if($mainSkill == null){
          continue;
        }
        if(!in_array($mainSkill, $weaponActiveSkill)){
          $this->context->buildViolation($constraint->messageNotActive)->addViolation();
        }
      }
    }
  }
}
