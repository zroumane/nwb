<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * @return Response
 */
class CreateBuildController extends AbstractController{
    
    private $kernel;
    private $locale;

    public function __construct(KernelInterface $kernel){
        $this->kernel = $kernel; 
    }

    public function index(Request $request) : Response
    {
        $this->locale = $request->getLocale();

        return $this->render('pages/create.html.twig', [
            'current_menu' => 'create',
            'locale' => $this->locale,
            'weapons' => json_decode(file_get_contents($this->kernel->getProjectDir().'/public/json/'.$this->locale.'/weapon.json'))
        ]);
    }

}
?>