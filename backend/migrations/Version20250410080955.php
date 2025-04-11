<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250410080955 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE retweet (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, original_post_id INT NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_45E67DB3A76ED395 (user_id), INDEX IDX_45E67DB3CD09ADDB (original_post_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE retweet ADD CONSTRAINT FK_45E67DB3A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE retweet ADD CONSTRAINT FK_45E67DB3CD09ADDB FOREIGN KEY (original_post_id) REFERENCES post (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE retweet DROP FOREIGN KEY FK_45E67DB3A76ED395');
        $this->addSql('ALTER TABLE retweet DROP FOREIGN KEY FK_45E67DB3CD09ADDB');
        $this->addSql('DROP TABLE retweet');
    }
}
