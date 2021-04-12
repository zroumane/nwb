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
            ->add('username', TextType::class, [
                'label_format' => 'registration.username',
                'constraints' => [
                    new NotBlank(),
                    new Length([
                        'min' => 6,
                        'max' => 64,
                    ]),
                ],
            ])
            ->add('email', EmailType::class, [
                'label_format' => 'registration.email',
                'constraints' => [
                    new Email()
                ],
            ])
            ->add('plainPassword', PasswordType::class, [
                'label_format' => 'registration.password',
                'mapped' => false,
                'constraints' => [
                    new NotBlank(),
                    new Length([
                        'min' => 6,
                        'max' => 64,
                    ]),
                ],
            ])
            ->add('agreeTerms', CheckboxType::class, [
                'label_format' => 'registration.agreeterms',
                'mapped' => false,
                'constraints' => [
                    new IsTrue(),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
