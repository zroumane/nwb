<?php

namespace App\Form;

use App\Entity\User;
use App\Validator\PseudoRegex;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class EditProfileType extends AbstractType
{
  public function buildForm(FormBuilderInterface $builder, array $options)
  {
    $builder->add("pseudo", TextType::class, [
      "label_format" => "login.pseudo",
      "constraints" => [
        new PseudoRegex(),
        new NotBlank([
          "message" => "pseudo.notblank",
        ]),
        new Length([
          "min" => 5,
          "minMessage" => "pseudo.min",
          "max" => 16,
          "maxMessage" => "pseudo.max",
        ]),
      ],
    ]);
  }

  public function configureOptions(OptionsResolver $resolver)
  {
    $resolver->setDefaults([
      "data_class" => User::class,
    ]);
  }
}
