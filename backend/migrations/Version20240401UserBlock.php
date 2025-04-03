<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240401UserBlock extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add user_block table for blocking functionality';
    }

    public function up(Schema $schema): void
    {
        // Création de la table user_block
        $this->addSql('CREATE TABLE IF NOT EXISTS user_block (
            id INT AUTO_INCREMENT NOT NULL,
            blocker_id INT NOT NULL,
            blocked_id INT NOT NULL,
            INDEX IDX_6B7A5B55D8A48BBD (blocker_id),
            INDEX IDX_6B7A5B55D1F5B0DCE (blocked_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Ajout des contraintes de clé étrangère
        $this->addSql('ALTER TABLE user_block 
            ADD CONSTRAINT FK_6B7A5B55D8A48BBD FOREIGN KEY (blocker_id) REFERENCES user (id) ON DELETE CASCADE,
            ADD CONSTRAINT FK_6B7A5B55D1F5B0DCE FOREIGN KEY (blocked_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Suppression des contraintes de clé étrangère d'abord
        $this->addSql('ALTER TABLE user_block DROP FOREIGN KEY FK_6B7A5B55D8A48BBD');
        $this->addSql('ALTER TABLE user_block DROP FOREIGN KEY FK_6B7A5B55D1F5B0DCE');
        
        // Puis suppression de la table
        $this->addSql('DROP TABLE IF EXISTS user_block');
    }
} 