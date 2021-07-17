<?php

namespace App\EventSubscriber;

use App\Entity\Build;
use ApiPlatform\Core\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class BuildSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
      return [
          KernelEvents::VIEW => ['sendDiscordWebhook', EventPriorities::POST_VALIDATE],
      ];
    }

    public function sendDiscordWebhook(ViewEvent $event): void
    {

      
      $build = $event->getControllerResult();
      $method = $event->getRequest()->getMethod();
      
      if (!$build instanceof Build || !in_array($method, ['POST', 'PUT'])) {
        return;
      }

      $webhookurl = "";
      if($_SERVER['APP_ENV'] == "dev"){
        $webhookurl = "https://discord.com/api/webhooks/865834966494871583/edtGJlO3laqnckfCK3K6eikj9_i_Ay0SqnVtPJj4az_dengIMofG84Q4d2W9YWqjPiYZ";
      }else{
        $webhookurl = "https://discord.com/api/webhooks/865831325441327124/L0YbNlzIBxguEASqN7h-NtLCOGk30xxEu8Omd2d1DcYyqhmT10WJ7FdF9Tbey-cgKwJp";
      }
      dd($_SERVER['APP_ENV']);

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
      curl_close( $ch );
        
    }
}