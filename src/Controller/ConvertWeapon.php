<?php

namespace App\Controller;

use PhpParser\Node\Expr\Cast\Array_;
use ApiPlatform\Core\Api\IriConverterInterface;
use Symfony\Component\HttpKernel\KernelInterface;

Class ConvertWeapon{

  static function convert($iriConverter, $kernel, $builds, $local): Array
  {

    $weaponLocal = json_decode(file_get_contents($kernel->getProjectDir() . "/public/json/" . $local . "/weapon.json"));
    $builds = array_map(function($build) use ($weaponLocal, $iriConverter){
      $build->setWeapons(array_map(function($w) use ($weaponLocal, $iriConverter){
        try{
          $weaponKey = $iriConverter->getItemFromIri($w)->getWeaponKey();
          try{
            return $weaponLocal->{$weaponKey};
          }
          catch(\Throwable $th){
            return $weaponKey;
          }
        }
        catch(\Throwable $th){
          return;
        }
      }, $build->getWeapons()));

      $build->setWeapons(array_filter($build->getWeapons(), function($w){return !is_null($w);}));
      return $build;
    }, $builds);

    return $builds;
  }

}