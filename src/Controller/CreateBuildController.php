<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use App\Http\ApiResponse;
use App\Entity\Builds;

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

    public function sendBuild(Request $request) : Response
    {
        $buildObject = [];
        if ($content = $request->getContent()) {
            $buildObject = json_decode($content, true);
        }

        $build = new Builds();
        $build->setTitle($buildObject['title'])
        ->setDescription($buildObject['description'])
        ->setType($buildObject['type']);
        $em = $this->getDoctrine()->getManager();
        $em->persist($build);
        $em->flush();

        return new Response(json_encode(['ok', $build->getId()]));
    }

}
?>