<?php

use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\ErrorHandler\Debug;
use Symfony\Component\HttpFoundation\Request;

require dirname(__DIR__) . "/vendor/autoload.php";

(new Dotenv())->bootEnv(dirname(__DIR__) . "/.env");

if ($_SERVER["APP_DEBUG"]) {
  umask(0000);

  Debug::enable();
}

if (php_sapi_name() == 'cli-server') {
  if (preg_match('/\/(?:json|img)/', $_SERVER["REQUEST_URI"]) > 0) {
      header("HTTP/1.1 301 Moved Permanently");
      header("Location: https://cdn.newworld-builder.com" . $_SERVER["REQUEST_URI"]);
      return;
  }
}

$kernel = new Kernel($_SERVER["APP_ENV"], (bool) $_SERVER["APP_DEBUG"]);
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
