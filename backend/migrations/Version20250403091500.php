<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter le champ is_read_only à la table user
 */
final class Version20250403091500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add is_read_only field to user table';
    }

    public function up(Schema $schema): void
    {
        // Cette migration ajoute simplement le champ is_read_only à la table user
        $this->addSql('ALTER TABLE user ADD is_read_only TINYINT(1) NOT NULL DEFAULT 0');
    }

    public function down(Schema $schema): void
    {
        // Suppression du champ en cas de rollback
        $this->addSql('ALTER TABLE user DROP COLUMN is_read_only');
    }
} 