<?php

namespace App\Controller;

use App\Kernel;
use Symfony\Component\HttpKernel\KernelInterface;

Class EntityParser{

  private $kernel;
  private $weaponLocal;
  private $weapons;

  public function __construct(KernelInterface $kernel)
  {
    $this->kernel = $kernel;
    $this->weaponLocal = [];
    $this->weapons = [];
  }

  public function setWeaponLocal($local){
    $this->weaponLocal = (array)json_decode(file_get_contents($this->kernel->getProjectDir() . "/public/json/" . $local . "/weapon.json"));
  }

  public function getWeaponLocal(){
    return $this->weaponLocal;
  }
  
  public function setWeapons($weapons)
  {
    foreach ($weapons as $index => $weapon) {
      $id = $weapon->getId();
      $weaponKey = $weapon->getWeaponKey();
      try{
        $this->weapons[$id] = $this->weaponLocal[$weaponKey];
      }
      catch(\Throwable $th){
        $this->weapons[$id] = $weaponKey;
      }  
    }
  }

  public function getWeapons(){
    return $this->weapons;
  }
  
  public function parseBuild($build){
    $build['weapons'] = array_map(function($w){
      if(!$w){
        return $w;
      }
      $id = intval(preg_replace('/[^0-9]+/', '', $w), 10);
      // $a = array_values(array_filter($this->weapons, fn($w) => $w->getId() == $id));
      // $weapon = $a[0];
      return $this->weapons[$id];
    }, $build['weapons']);
    return $build;
  }

  // public function convertBuild($iriConverter, $kernel, $builds, $local): Array
  // {

  //   $builds = array_map(function($build) use ($iriConverter, $kernel, $local){
  //     $build->setWeapons(array_map(function($w) use ($iriConverter, $kernel, $local){
  //       try{
  //         $weapon = $iriConverter->getItemFromIri($w);
  //         return self::weapon($kernel, $weapon, $local)->getWeaponKey();
  //       }
  //       catch(\Throwable $th){
  //         return $w;
  //       }
  //     }, $build->getWeapons()));

  //     $build->setWeapons(array_filter($build->getWeapons(), function($w){return !is_null($w);}));
  //     return $build;
  //   }, $builds);

  //   return $builds;
  // }
  
}