ALTER TABLE reports
DROP CONSTRAINT fk_reports_reported_post,
ADD CONSTRAINT fk_reports_reported_post
FOREIGN KEY (reported_post_id)
REFERENCES posts(id)
ON DELETE SET NULL;
