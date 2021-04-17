<?php

namespace App\Entity;

use App\Repository\PatchNoteRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=PatchNoteRepository::class)
 */
class PatchNote
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $title;

    /**
     * @ORM\Column(type="text")
     */
    private $content;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $igVersion;

    /**
     * @ORM\Column(type="datetime")
     */
    private $igDate;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;

        return $this;
    }

    public function getIgVersion(): ?string
    {
        return $this->igVersion;
    }

    public function setIgVersion(string $igVersion): self
    {
        $this->igVersion = $igVersion;

        return $this;
    }

    public function getIgDate(): ?\DateTimeInterface
    {
        return $this->igDate;
    }

    public function setIgDate(\DateTimeInterface $igDate): self
    {
        $this->igDate = $igDate;

        return $this;
    }
}
