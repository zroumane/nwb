<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * @param TranslatorInterface $translator
 * @return Response
 */
class CreateBuildController extends AbstractController{
    
    private $kernel;
    private $lang;

    public function __construct(KernelInterface $kernel){
        $this->kernel = $kernel; 
    }

    public function index(Request $request) : Response
    {
        $this->lang = $request->getLocale();

        return $this->render('pages/create.html.twig', [
            'current_menu' => 'create',
            'weapons' => json_encode(file_get_contents($this->kernel->getProjectDir().'/public/json/'.$this->lang.'/weapon.json')),
            'lang' => $this->lang
        ]);
    }

}
?>