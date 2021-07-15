<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;
use ApiPlatform\Core\Api\IriConverterInterface;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;


class MainSkillValidator extends ConstraintValidator
{

  private $iriConverter;

  public function __construct(IriConverterInterface $iriConverter)
  {
    $this->iriConverter = $iriConverter;
  }

  public function validate($mainSkills, Constraint $constraint)
  {
    $activeSkill = $this->context->getObject()->getActiveSkills();
    foreach($mainSkills as $weaponIndex => $weaponMainSkills) {
      $weaponActiveSkill = $activeSkill[$weaponIndex];
      if(count($weaponMainSkills) != 3){
        $this->context->buildViolation($constraint->messageLenght)->addViolation();
      }
      foreach ($weaponMainSkills as $key => $mainSkill) {
        if($mainSkill == null){
          continue;
        }
        try {
          $mainSkillItem = $this->iriConverter->getItemFromIri($mainSkill);
          if($mainSkillItem->type != 1){
            $this->context->buildViolation($constraint->messageNotAbility)->addViolation();
          }
        } catch (\Throwable $th) {
          $this->context->buildViolation($constraint->messageNotFound)->addViolation();
        }
        if(!in_array($mainSkill, $weaponActiveSkill)){
          $this->context->buildViolation($constraint->messageNotActive)->addViolation();
        }
      }
    }
  }
}
