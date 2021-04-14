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
use Symfony\Component\Validator\Constraints\Regex;

class RegistrationFormType extends AbstractType
{

  public function buildForm(FormBuilderInterface $builder, array $options)
  {
    $builder
      ->add('pseudo', TextType::class, [
        'label_format' => 'login.pseudo',
        'constraints' => [
          new Regex([
            'pattern' => '[^A-Za-z0-9]',
            'match' => true,
            'message' => 'pseudo.regex'
          ]),
          new NotBlank([
            'message' => 'pseudo.notblank'
          ]),
          new Length([
            'min' => 5,
            'minMessage' => 'pseudo.min',
            'max' => 16,
            'maxMessage' => 'pseudo.max'
          ]),
        ],
      ])
      ->add('email', EmailType::class, [
        'label_format' => 'login.email',
        'constraints' => [
          new NotBlank([
            'message' => 'email.notblank'
          ]),
          new Email([
            'message' => 'email.valid'
          ]),
        ],
      ])
      ->add('plainPassword', PasswordType::class, [
        'label_format' => 'login.password',
        'mapped' => false,
        'constraints' => [
          new Regex([
            'pattern' => '/[A-Z]/',
            'match' => false,
            'message' => 'pseudo.upper'
          ]),
          new Regex([
            'pattern' => '/[a-z]/',
            'match' => false,
            'message' => 'pseudo.lower'
          ]),
          new Regex([
            'pattern' => '/[0-9]/',
            'match' => false,
            'message' => 'pseudo.digit'
          ]),
          new NotBlank([
            'message' => 'password.notblank',
          ]),
          new Length([
            'min' => 8,
            'minMessage' => 'password.min',
            'max' => 4096,
            'maxMessage' => 'password.max'
          ]),
        ],
      ])
      ->add('agreeTerms', CheckboxType::class, [
        'label_format' => 'login.agreeterms',
        'mapped' => false,
        'constraints' => [
          new IsTrue([
            'message' => 'agreeterms.istrue',
          ]),
        ],
      ]);
  }

  public function configureOptions(OptionsResolver $resolver)
  {
    $resolver->setDefaults([
      'data_class' => User::class,
      'translation_domain' => 'messages'
    ]);
  }
}
