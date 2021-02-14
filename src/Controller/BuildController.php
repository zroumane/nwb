<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @param TranslatorInterface $translator
 * @return Response
 */
class BuildController extends AbstractController{

    public function index() : Response
    {
        return $this->render('pages/build.html.twig', [
            'current_menu' => 'build'
        ]);
    }

}
?>