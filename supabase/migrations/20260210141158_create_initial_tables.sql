create table users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    password text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
--     id uuid primary key references auth.users(id) on delete cascade,
--     name text not null,
--     email text not null unique, -- email도 auth.users에서 관리되므로 unique 제약 조건만 추가합니다.
--     created_at timestamptz not null default now(),
--     updated_at timestamptz not null default now()

create table posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null,
    content text not null,
    excerpt text not null,
    category_id uuid not null references categories(id) on delete restrict,
    published boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table tags (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table post_tags (
    -- id uuid primary key default gen_random_uuid(),
    -- post_tags 테이블의 id 필드를 단일 기본 키로 사용하는 대신, 
    -- (post_id, tag_id) 조합을 복합 기본 키로 사용하는 것을 고려해볼 수 있습니다.
    -- 이는 특정 게시글에 특정 태그가 중복으로 연결되는 것을 논리적으로 방지하며,
    -- 많은 경우 관계형 테이블에서 더 자연스러운 설계입니다.
    post_id uuid not null references posts(id) on delete cascade,
    tag_id uuid not null references tags(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    primary key (post_id, tag_id)
);

create table categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table posts_images (
    id uuid primary key default gen_random_uuid(),
    -- 게시글이 삭제될 때 관련 이미지도 삭제되도록 ON DELETE CASCADE 정책을 적용
    post_id uuid not null references posts(id) on delete cascade,
    image_url text not null,
    sort_order int not null,
    caption text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table projects (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null,
    content text not null,
    excerpt text not null,
    category_id uuid not null references categories(id) on delete restrict,
    published boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table reviews (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references posts(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade, -- 또는 auth.users(id)
    rating int not null,
    comment text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);