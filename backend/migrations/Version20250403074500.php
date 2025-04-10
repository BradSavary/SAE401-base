<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ajoute un champ is_censored aux entités Post et Comment pour permettre la censure de contenu
 */
final class Version20250403074500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute un champ is_censored aux entités Post et Comment';
    }

    public function up(Schema $schema): void
    {
        // Ajouter le champ is_censored à la table Post
        $this->addSql('ALTER TABLE post ADD is_censored TINYINT(1) NOT NULL DEFAULT 0');
        
        // Ajouter le champ is_censored à la table Comment
        $this->addSql('ALTER TABLE comment ADD is_censored TINYINT(1) NOT NULL DEFAULT 0');
    }

    public function down(Schema $schema): void
    {
        // Supprimer le champ is_censored de la table Post
        $this->addSql('ALTER TABLE post DROP is_censored');
        
        // Supprimer le champ is_censored de la table Comment
        $this->addSql('ALTER TABLE comment DROP is_censored');
    }
} 