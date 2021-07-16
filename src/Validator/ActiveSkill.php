<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class ActiveSkill extends Constraint
{
  public $Lenght = "Array lenght is wrong.";
  public $NotFound = "{{ skill }} not exist.";
  public $SkillDuplicate = "{{ skill }} is duplicated.";
  public $NotActived = "{{ skill }} is not selected.";
  public $NotAbility = "{{ skill }} is not an ability.";
}
