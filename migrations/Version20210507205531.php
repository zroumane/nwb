<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210507205531 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE build_weapon (build_id INT NOT NULL, weapon_id INT NOT NULL, INDEX IDX_FEA1A61917C13F8B (build_id), INDEX IDX_FEA1A61995B82273 (weapon_id), PRIMARY KEY(build_id, weapon_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE skill (id INT AUTO_INCREMENT NOT NULL, weapon_id INT DEFAULT NULL, skill_key VARCHAR(255) NOT NULL, branch INT NOT NULL, INDEX IDX_5E3DE47795B82273 (weapon_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE weapon (id INT AUTO_INCREMENT NOT NULL, weapon_key VARCHAR(255) NOT NULL, branch JSON NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE build_weapon ADD CONSTRAINT FK_FEA1A61917C13F8B FOREIGN KEY (build_id) REFERENCES build (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE build_weapon ADD CONSTRAINT FK_FEA1A61995B82273 FOREIGN KEY (weapon_id) REFERENCES weapon (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE skill ADD CONSTRAINT FK_5E3DE47795B82273 FOREIGN KEY (weapon_id) REFERENCES weapon (id)');
        $this->addSql('ALTER TABLE build ADD active_skills JSON NOT NULL, DROP weapon, DROP skills');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE build_weapon DROP FOREIGN KEY FK_FEA1A61995B82273');
        $this->addSql('ALTER TABLE skill DROP FOREIGN KEY FK_5E3DE47795B82273');
        $this->addSql('DROP TABLE build_weapon');
        $this->addSql('DROP TABLE skill');
        $this->addSql('DROP TABLE weapon');
        $this->addSql('ALTER TABLE build ADD skills JSON NOT NULL, CHANGE active_skills weapon JSON NOT NULL');
    }
}
