<?php

namespace App\EventSubscriber;

use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
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

    if ($locale = $request->attributes->get('_locale')) {
      $request->getSession()->set('_locale', $locale);
    } else {
      $request->setLocale($request->getSession()->get('_locale',$request->getDefaultLocale()));
    }

    if(!$session->get('views')){
      $session->set('views', []);
    }
  }
}
