<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\IsTrue;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class RegistrationFormType extends AbstractType
{
  public function buildForm(FormBuilderInterface $builder, array $options)
  {
    $builder
      ->add('pseudo', TextType::class, [
        'label_format' => 'registration.pseudo.label',
        'constraints' => [
          new NotBlank([
            'message' => 'registration.pseudo.notblank'
          ]),
          new Length([
            'min' => 6,
            'minMessage' => 'registration.pseudo.min',
            'max' => 64,
            'maxMessage' => 'registration.pseudo.max'
          ]),
        ],
      ])
      ->add('email', EmailType::class, [
        'label_format' => 'registration.email.label',
        'constraints' => [
          new NotBlank([
            'message' => 'registration.email.notblank'
          ]),
          new Email([
            'message' => 'registration.email.valid'
          ])
        ],
      ])
      ->add('plainPassword', PasswordType::class, [
        'label_format' => 'registration.password.label',
        'mapped' => false,
        'constraints' => [
          new NotBlank([
            'message' => 'registration.password.notblank',
          ]),
          new Length([
            'min' => 6,
            'minMessage' => 'registration.password.min',
            'max' => 4096,
            'maxMessage' => 'registration.password.max'
          ]),
        ],
      ])
      ->add('agreeTerms', CheckboxType::class, [
        'label_format' => 'registration.agreeterms.label',
        'mapped' => false,
        'constraints' => [
          new IsTrue([
            'message' => 'registration.agreeterms.istrue',
          ]),
        ],
      ]);
  }

  public function configureOptions(OptionsResolver $resolver)
  {
    $resolver->setDefaults([
      'data_class' => User::class,
      'translation_domain' => 'validators'
    ]);
  }
}
