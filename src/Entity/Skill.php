<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiSubresource;
use App\Repository\SkillRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Serializer\Annotation\Groups;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\MaxDepth;

/**
 * @ORM\Entity(repositoryClass=SkillRepository::class)
 */
#[ApiResource()]
class Skill
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
  private $skillKey;

  /**
   * @ORM\Column(type="integer")
   */
  private $side;

  /**
   * @ORM\ManyToOne(targetEntity=Weapon::class, inversedBy="skills")
   */
  private $weapon;

  /**
   * @ORM\Column(type="integer")
   */
  private $col;

  /**
   * @ORM\Column(type="integer")
   */
  private $line;

  /**
   * @ORM\ManyToOne(targetEntity=Skill::class, inversedBy="children")
   */
  private $parent;

  /**
   * @ORM\OneToMany(targetEntity=Skill::class, mappedBy="parent")
   */
  private $children;

  public function __construct()
  {
    $this->children = new ArrayCollection();
  }

  public function getId(): ?int
  {
    return $this->id;
  }

  public function getSkillKey(): ?string
  {
    return $this->skillKey;
  }

  public function setSkillKey(string $skillKey): self
  {
    $this->skillKey = $skillKey;

    return $this;
  }

  public function getSide(): ?int
  {
    return $this->side;
  }

  public function setSide(int $side): self
  {
    $this->side = $side;

    return $this;
  }

  public function getWeapon(): ?Weapon
  {
    return $this->weapon;
  }

  public function setWeapon(?Weapon $weapon): self
  {
    $this->weapon = $weapon;

    return $this;
  }

  public function getCol(): ?int
  {
    return $this->col;
  }

  public function setCol(int $col): self
  {
    $this->col = $col;

    return $this;
  }

  public function getLine(): ?int
  {
    return $this->line;
  }

  public function setLine(int $line): self
  {
    $this->line = $line;

    return $this;
  }

  public function getParent(): ?self
  {
    return $this->parent;
  }

  public function setParent(?self $parent): self
  {
    $this->parent = $parent;

    return $this;
  }

  /**
   * @return Collection|self[]
   */
  public function getChildren(): Collection
  {
    return $this->children;
  }

  public function addChild(self $child): self
  {
    if (!$this->children->contains($child)) {
      $this->children[] = $child;
      $child->setParent($this);
    }

    return $this;
  }

  public function removeChild(self $child): self
  {
    if ($this->children->removeElement($child)) {
      // set the owning side to null (unless already changed)
      if ($child->getParent() === $this) {
        $child->setParent(null);
      }
    }

    return $this;
  }
}
