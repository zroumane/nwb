<?php

namespace App\Form;

use App\Entity\PatchNote;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PatchNoteType extends AbstractType
{
  public function buildForm(FormBuilderInterface $builder, array $options)
  {
    $builder
      ->add('title')
      ->add('content', TextareaType::class, [
        'label' => 'Content (HTML included)'
      ])
      ->add('igVersion', TextType::class, [
        'label' => 'In game version'
      ])
      ->add('igDate', DateType::class, [
        'label' => 'In game update date',
        'widget' => 'single_text',
      ]);
  }

  public function configureOptions(OptionsResolver $resolver)
  {
    $resolver->setDefaults([
      'data_class' => PatchNote::class,
    ]);
  }
}
