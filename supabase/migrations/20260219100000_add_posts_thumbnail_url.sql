-- 대표 이미지(썸네일) URL 저장. 본문에 들어간 이미지 URL 중 하나를 그대로 저장.
alter table posts add column if not exists thumbnail_url text;
