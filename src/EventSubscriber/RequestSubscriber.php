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
      // must be registered before (i.e. with a higher priority than) the default Locale listener
      KernelEvents::REQUEST => [["onKernelRequest", 20]],
    ];
  }

  public function onKernelRequest(RequestEvent $event)
  {
    $request = $event->getRequest();
    $session = $request->getSession();

    if (!$request->hasPreviousSession()) {
      if (array_key_exists("HTTP_ACCEPT_LANGUAGE", $_SERVER)) {
        $locale = substr($_SERVER["HTTP_ACCEPT_LANGUAGE"], 0, 2);

        // $locale_array = ['de','en','es','fr','it','pl','pt'];
        $locale_array = ["en", "fr"];

        $locale = in_array($locale, $locale_array) ? $locale : $request->getDefaultLocale();
        $request->setLocale($locale);
      }
    }else{ 
      $request->setLocale($session->get("_locale", $request->getDefaultLocale()));
    }

    if(!$session->get('views')){
      $session->set('views', []);
    }
    
  }

}
