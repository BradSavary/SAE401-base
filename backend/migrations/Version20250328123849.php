<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250328123849 extends AbstractMigration
{
    public function up(Schema $schema): void
{
    // Check if the foreign key constraint already exists
    $this->addSql("
        SET @constraint_exists = (
            SELECT COUNT(*)
            FROM information_schema.table_constraints
            WHERE constraint_name = 'FK_5A8A6C8DF675F31B'
              AND table_name = 'post'
        );
        IF @constraint_exists = 0 THEN
            ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DF675F31B FOREIGN KEY (author_id) REFERENCES user (id);
        END IF;
    ");

    // Check if the index already exists before creating it
    $this->addSql("
        SET @index_exists = (
            SELECT COUNT(*)
            FROM information_schema.statistics
            WHERE index_name = 'IDX_5A8A6C8DF675F31B'
              AND table_name = 'post'
        );
        IF @index_exists = 0 THEN
            CREATE INDEX IDX_5A8A6C8DF675F31B ON post (author_id);
        END IF;
    ");
}
}
