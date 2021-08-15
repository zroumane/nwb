<?php

namespace App\EventSubscriber;

use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class RequestSubscriber implements EventSubscriberInterface
{

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

    $uri = explode('/', $request->getRequestUri());
    $locale_array = ["en", "fr"];

    $bypass = ['api', '_profiler', '_wdt'];

    if( !in_array($uri[1], $bypass) && !in_array($uri[1], $locale_array) ){
      $event->setResponse(new RedirectResponse('/en' . $request->getRequestUri()));
    }

    if(!$session->get('views')){
      $session->set('views', []);
    }
  }
}