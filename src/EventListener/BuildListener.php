<?php

namespace App\EventListener;

use App\Entity\Build;
use Doctrine\Persistence\Event\LifecycleEventArgs;

class BuildListener
{

  public function prePersist(Build $build, LifecycleEventArgs $event): void
  {
    $build->setCreatedAt(new \DateTime("now"));
    $build->setUpdatedAt(new \DateTime("now"));
  }
  

  public function preUpdate(Build $build, LifecycleEventArgs $event): void
  {
    $build->setUpdatedAt(new \DateTime("now"));
  }


  public function postUpdate(Build $build, LifecycleEventArgs $event){
    
    $webhookurl = "https://discord.com/api/webhooks/865831325441327124/L0YbNlzIBxguEASqN7h-NtLCOGk30xxEu8Omd2d1DcYyqhmT10WJ7FdF9Tbey-cgKwJp";
    // $webhookurl = "https://discord.com/api/webhooks/865834966494871583/edtGJlO3laqnckfCK3K6eikj9_i_Ay0SqnVtPJj4az_dengIMofG84Q4d2W9YWqjPiYZ";
    $timestamp = date("c", strtotime("now"));
    $author = $build->getAuthor();

    $json_data = json_encode([
      "embeds" => [
        [
          "title" => $build->getName(),
          "url" => sprintf("https://newworld-builder.com/build/%d", $build->getId()),
          "author" => [
            "name" => sprintf("From %s", $author->getPseudo()),
            "url" => sprintf("https://newworld-builder.com/profile/%d", $author->getId()),
          ],
          "timestamp" => $timestamp,
          "color" => hexdec("ffffff")
        ]
      ]
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );


    $ch = curl_init( $webhookurl );
    curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
    curl_setopt( $ch, CURLOPT_POST, 1);
    curl_setopt( $ch, CURLOPT_POSTFIELDS, $json_data);
    curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt( $ch, CURLOPT_HEADER, 0);
    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);

    $response = curl_exec( $ch );
    // If you need to debug, or find out why you can't send message uncomment line below, and execute script.
    // echo $response;
    curl_close( $ch );

  }
}