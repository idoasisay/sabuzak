-- 블로그 글 이미지용 공개 버킷 (읽기는 모두, 업로드는 로그인 사용자만)
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- 공개 읽기
create policy "blog-images public read"
on storage.objects for select
using (bucket_id = 'blog-images');

-- 로그인 사용자만 업로드
create policy "blog-images authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'blog-images');

-- 로그인 사용자만 삭제 (본인 작성 글에서 이미지 제거 시 등)
create policy "blog-images authenticated delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'blog-images');
