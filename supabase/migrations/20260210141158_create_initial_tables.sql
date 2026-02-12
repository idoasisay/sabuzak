create table users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    password text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null,
    content text not null,
    excerpt text not null,
    category_id uuid not null,
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
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null,
    tag_id uuid not null,
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

create table posts_images (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null,
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
    category_id uuid not null,
    published boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table reviews (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null,
    user_id uuid not null,
    rating int not null,
    comment text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);