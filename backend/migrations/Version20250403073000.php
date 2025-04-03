<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add created_at column to user_block table
 */
final class Version20250403073000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add created_at column to user_block table';
    }

    public function up(Schema $schema): void
    {
        // Add created_at column to user_block table with default current timestamp
        $this->addSql('ALTER TABLE user_block ADD created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
        
        // Remove the default after all rows are updated
        $this->addSql('ALTER TABLE user_block MODIFY created_at DATETIME NOT NULL');
        
        // Add unique constraint to prevent duplicate blocks
        $this->addSql('ALTER TABLE user_block ADD CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)');
    }

    public function down(Schema $schema): void
    {
        // Remove unique constraint
        $this->addSql('ALTER TABLE user_block DROP INDEX unique_block');
        
        // Remove created_at column
        $this->addSql('ALTER TABLE user_block DROP COLUMN created_at');
    }
} 