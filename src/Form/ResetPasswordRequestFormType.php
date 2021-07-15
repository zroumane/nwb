<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\EmailType;

class ResetPasswordRequestFormType extends AbstractType
{
  public function buildForm(FormBuilderInterface $builder, array $options): void
  {
    $builder->add("email", EmailType::class, [
      "attr" => ["autocomplete" => "email"],
      "constraints" => [
        new NotBlank([
          "message" => "email.notblank",
        ]),
      ],
      "label" => "login.email",
    ]);
  }

  public function configureOptions(OptionsResolver $resolver): void
  {
    $resolver->setDefaults([]);
  }
}
