<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class CreateBuildController extends AbstractController{

    public function index() : Response
    {
        return $this->render('pages/create.html.twig', [
            'current_menu' => 'create'
        ]);
    }

}
?>