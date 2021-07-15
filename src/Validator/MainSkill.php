<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class MainSkill extends Constraint
{
  public $messageNotFound = "Some mainSkill(s) not exist(s).";
  public $messageLenght = "There is the wrong mainSkills array length.";
  public $messageNotActive = "Some mainSkill(s) are not activeSkill(s).";
  public $messageNotAbility = "Some mainSkill(s) are not abilities.";
}
