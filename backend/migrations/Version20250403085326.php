<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250403085326 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment CHANGE is_censored is_censored TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526C4B89032C FOREIGN KEY (post_id) REFERENCES post (id)');
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526CA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE post CHANGE is_censored is_censored TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DF675F31B FOREIGN KEY (author_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE post_interaction ADD CONSTRAINT FK_DBCD77884B89032C FOREIGN KEY (post_id) REFERENCES post (id)');
        $this->addSql('ALTER TABLE post_interaction ADD CONSTRAINT FK_DBCD7788A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE post_media ADD CONSTRAINT FK_FD372DE34B89032C FOREIGN KEY (post_id) REFERENCES post (id)');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D37808B1AD FOREIGN KEY (subscriber_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE subscription ADD CONSTRAINT FK_A3C664D3F9B6176 FOREIGN KEY (subscribed_to_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user ADD is_read_only TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE user_block DROP FOREIGN KEY FK_6B7A5B55D1F5B0DCE');
        $this->addSql('ALTER TABLE user_block DROP FOREIGN KEY FK_6B7A5B55D8A48BBD');
        $this->addSql('ALTER TABLE user_block ADD CONSTRAINT FK_61D96C7A548D5975 FOREIGN KEY (blocker_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_block ADD CONSTRAINT FK_61D96C7A21FF5136 FOREIGN KEY (blocked_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_block RENAME INDEX idx_6b7a5b55d8a48bbd TO IDX_61D96C7A548D5975');
        $this->addSql('ALTER TABLE user_block RENAME INDEX idx_6b7a5b55d1f5b0dce TO IDX_61D96C7A21FF5136');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_block DROP FOREIGN KEY FK_61D96C7A548D5975');
        $this->addSql('ALTER TABLE user_block DROP FOREIGN KEY FK_61D96C7A21FF5136');
        $this->addSql('ALTER TABLE user_block ADD CONSTRAINT FK_6B7A5B55D1F5B0DCE FOREIGN KEY (blocked_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_block ADD CONSTRAINT FK_6B7A5B55D8A48BBD FOREIGN KEY (blocker_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_block RENAME INDEX idx_61d96c7a21ff5136 TO IDX_6B7A5B55D1F5B0DCE');
        $this->addSql('ALTER TABLE user_block RENAME INDEX idx_61d96c7a548d5975 TO IDX_6B7A5B55D8A48BBD');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526C4B89032C');
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CA76ED395');
        $this->addSql('ALTER TABLE comment CHANGE is_censored is_censored TINYINT(1) DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D37808B1AD');
        $this->addSql('ALTER TABLE subscription DROP FOREIGN KEY FK_A3C664D3F9B6176');
        $this->addSql('ALTER TABLE user DROP is_read_only');
        $this->addSql('ALTER TABLE post_media DROP FOREIGN KEY FK_FD372DE34B89032C');
        $this->addSql('ALTER TABLE post_interaction DROP FOREIGN KEY FK_DBCD77884B89032C');
        $this->addSql('ALTER TABLE post_interaction DROP FOREIGN KEY FK_DBCD7788A76ED395');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DA76ED395');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DF675F31B');
        $this->addSql('ALTER TABLE post CHANGE is_censored is_censored TINYINT(1) DEFAULT 0 NOT NULL');
    }
}
