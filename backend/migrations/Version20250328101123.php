<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250328101123 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE subscription ADD subscriber_id INT NOT NULL, ADD subscribed_to_id INT NOT NULL, DROP subscriber, DROP subscribed_to');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D37808B1AD FOREIGN KEY (subscriber_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D3F9B6176 FOREIGN KEY (subscribed_to_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_A3C664D37808B1AD ON subscription (subscriber_id)');
        $this->addSql('CREATE INDEX IDX_A3C664D3F9B6176 ON subscription (subscribed_to_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D37808B1AD');
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D3F9B6176');
        $this->addSql('DROP INDEX IDX_A3C664D37808B1AD ON subscription');
        $this->addSql('DROP INDEX IDX_A3C664D3F9B6176 ON subscription');
        $this->addSql('ALTER TABLE subscription ADD subscriber VARCHAR(255) NOT NULL, ADD subscribed_to VARCHAR(255) NOT NULL, DROP subscriber_id, DROP subscribed_to_id');
    }
}
