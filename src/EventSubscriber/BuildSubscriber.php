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

      $author = $build->getAuthor();
      if(!$author){
        return;
      }

      $webhookurl = "";

      if($_SERVER['APP_ENV'] == "dev"){
        $webhookurl = "https://discord.com/api/webhooks/865887749214830603/vLjFkK4aknq_KhQytBocz7XniBQx-t8_5s-EhcTli73aawge0ab2V6NyJ4a-jq7KRcyr";
      }else{
        $webhookurl = "https://discord.com/api/webhooks/865831325441327124/L0YbNlzIBxguEASqN7h-NtLCOGk30xxEu8Omd2d1DcYyqhmT10WJ7FdF9Tbey-cgKwJp";
      }

      $authorTitle = "";

      if($method == "POST"){
        $authorTitle  = "New build by %s :";
      }else{
        $authorTitle  = "Build edited by %s :";
      }


      
      $timestamp = date("c", strtotime("now"));
      $buildId = $build->getId();
  
      $json_data = json_encode([
        "embeds" => [
          [
            "title" => $build->getName(),
            "url" => sprintf("https://newworld-builder.com/build/%d", $buildId),
            "author" => [
              "name" => sprintf($authorTitle, $author->getPseudo()),
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
      curl_exec( $ch );
      curl_close( $ch );
        
    }
}