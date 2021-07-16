<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;
use ApiPlatform\Core\Api\IriConverterInterface;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class WeaponValidator extends ConstraintValidator
{

  private $iriConverter;

  public function __construct(IriConverterInterface $iriConverter)
  {
    $this->iriConverter = $iriConverter;
  }
  
  public function validate($weapons, Constraint $constraint)
  {

    if (!$constraint instanceof Weapon) {
      throw new UnexpectedTypeException($constraint, Weapon::class);
    }

    $nullCount = 0;

    foreach ($weapons as $index => $weapon) {
      if (!$weapon) {
        $nullCount++;
      }
    }

    if($nullCount > 1){
      $this->context->buildViolation($constraint->noWeapon)->addViolation();
    }
  }
}
