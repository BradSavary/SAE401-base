<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250328100548 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE subscription (id INT AUTO_INCREMENT NOT NULL, subscriber VARCHAR(255) NOT NULL, subscribed_to VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE post_interaction CHANGE type type VARCHAR(50) NOT NULL');
        $this->addSql('ALTER TABLE post_interaction ADD CONSTRAINT FK_DBCD77884B89032C FOREIGN KEY (post_id) REFERENCES post (id)');
        $this->addSql('ALTER TABLE post_interaction ADD CONSTRAINT FK_DBCD7788A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_DBCD77884B89032C ON post_interaction (post_id)');
        $this->addSql('CREATE INDEX IDX_DBCD7788A76ED395 ON post_interaction (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE subscription');
        $this->addSql('ALTER TABLE post_interaction DROP FOREIGN KEY FK_DBCD77884B89032C');
        $this->addSql('ALTER TABLE post_interaction DROP FOREIGN KEY FK_DBCD7788A76ED395');
        $this->addSql('DROP INDEX IDX_DBCD77884B89032C ON post_interaction');
        $this->addSql('DROP INDEX IDX_DBCD7788A76ED395 ON post_interaction');
        $this->addSql('ALTER TABLE post_interaction CHANGE type type VARCHAR(255) NOT NULL');
    }
}
