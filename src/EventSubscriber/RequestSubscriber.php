<?php

namespace App\EventSubscriber;

use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class RequestSubscriber implements EventSubscriberInterface
{

  function __construct()
  {
    $this->locale_array = ["de", "en", "es", "fr", "it", "pl", "pt"];
  }

  public static function getSubscribedEvents()
  {
    return [
      KernelEvents::REQUEST => [["onKernelRequest", 20]],
    ];
  }

  public function onKernelRequest(RequestEvent $event)
  {    
    $request = $event->getRequest();
    $session = $request->getSession();

    
    if(substr($request->attributes->get('_route'), 0, 3) == "app" || $request->attributes->get('_controller') == "error_controller"){
      $uri = explode('/', $request->getRequestUri());
      if(!in_array($uri[1], $this->locale_array)){
        $event->setResponse(new RedirectResponse('/en' . $request->getRequestUri()));
      }
    }

    if(!$session->get('views')){
      $session->set('views', []);
    }

  }
}