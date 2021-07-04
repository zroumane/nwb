<?php

namespace App\Validator;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class JsonArrayLenght extends Constraint
{
  public $message = "This json array has not the valid lenght.";
  public $messageblank = "The values should not be blank.";
}
