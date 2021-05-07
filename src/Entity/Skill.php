<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\SkillRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource()
 * @ORM\Entity(repositoryClass=SkillRepository::class)
 */
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
    private $branch;

    /**
     * @ORM\ManyToOne(targetEntity=Weapon::class, inversedBy="skills")
     */
    private $weapon;


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

    public function getBranch(): ?int
    {
        return $this->branch;
    }

    public function setBranch(int $branch): self
    {
        $this->branch = $branch;

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
}
