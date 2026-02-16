create table users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    password text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null,
    content text not null,
    excerpt text not null,
    category_id uuid not null references categories(id) on delete restrict,
    published boolean not null default false,
    published_at timestamptz default null,
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
    post_id uuid not null references posts(id) on delete cascade,
    tag_id uuid not null references tags(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (post_id, tag_id)
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