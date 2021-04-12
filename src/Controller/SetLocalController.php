<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;


/**
 * @param String $locale
 * @return array
 */
class SetLocalController{

    /** 
    * @Route("/setlocale/{locale}")
    */ 
    public function index(Request $request, $locale = null)
    {

        // $locale_array = ['de','en','es','fr','it','pl','pt'];
        $locale_array = ['en', 'fr'];

        if(in_array($locale, $locale_array))
        {
            // On enregistre la langue en session
            $request->getSession()->set('_locale', $locale);
        }
    
        // on tente de rediriger vers la page d'origine
        $url = $request->headers->get('referer');
        if(empty($url))
        {
            $url = $this->container->get('router')->generate('index');
        }
    
        return new RedirectResponse($url);
    }

}
?>