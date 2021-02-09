<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class BuildController extends AbstractController{

    public function index() : Response
    {
        return $this->render('pages/build.html.twig', [
            'current_menu' => 'build'
        ]);
    }

}
?>