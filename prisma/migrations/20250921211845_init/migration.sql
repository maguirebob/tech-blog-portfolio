-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN', 'AUTHOR');

-- CreateEnum
CREATE TYPE "public"."ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Articles" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "public"."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "Articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArticleTags" (
    "article_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "ArticleTags_pkey" PRIMARY KEY ("article_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."Projects" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "image_url" TEXT,
    "demo_url" TEXT,
    "github_url" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "Projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Technologies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectTechnologies" (
    "project_id" INTEGER NOT NULL,
    "technology_id" INTEGER NOT NULL,

    CONSTRAINT "ProjectTechnologies_pkey" PRIMARY KEY ("project_id","technology_id")
);

-- CreateTable
CREATE TABLE "public"."Comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" INTEGER NOT NULL,
    "article_id" INTEGER NOT NULL,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SiteStats" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "public"."Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE INDEX "Users_username_idx" ON "public"."Users"("username");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "public"."Users"("email");

-- CreateIndex
CREATE INDEX "Users_role_is_active_idx" ON "public"."Users"("role", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "public"."Categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_slug_key" ON "public"."Categories"("slug");

-- CreateIndex
CREATE INDEX "Categories_slug_idx" ON "public"."Categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "public"."Tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_slug_key" ON "public"."Tags"("slug");

-- CreateIndex
CREATE INDEX "Tags_slug_idx" ON "public"."Tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Articles_slug_key" ON "public"."Articles"("slug");

-- CreateIndex
CREATE INDEX "Articles_slug_idx" ON "public"."Articles"("slug");

-- CreateIndex
CREATE INDEX "Articles_status_published_at_idx" ON "public"."Articles"("status", "published_at");

-- CreateIndex
CREATE INDEX "Articles_featured_status_idx" ON "public"."Articles"("featured", "status");

-- CreateIndex
CREATE INDEX "Articles_author_id_idx" ON "public"."Articles"("author_id");

-- CreateIndex
CREATE INDEX "Articles_category_id_idx" ON "public"."Articles"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "Projects_slug_key" ON "public"."Projects"("slug");

-- CreateIndex
CREATE INDEX "Projects_slug_idx" ON "public"."Projects"("slug");

-- CreateIndex
CREATE INDEX "Projects_status_featured_idx" ON "public"."Projects"("status", "featured");

-- CreateIndex
CREATE INDEX "Projects_author_id_idx" ON "public"."Projects"("author_id");

-- CreateIndex
CREATE INDEX "Projects_order_idx" ON "public"."Projects"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Technologies_name_key" ON "public"."Technologies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Technologies_slug_key" ON "public"."Technologies"("slug");

-- CreateIndex
CREATE INDEX "Technologies_slug_idx" ON "public"."Technologies"("slug");

-- CreateIndex
CREATE INDEX "Comments_article_id_idx" ON "public"."Comments"("article_id");

-- CreateIndex
CREATE INDEX "Comments_author_id_idx" ON "public"."Comments"("author_id");

-- CreateIndex
CREATE INDEX "Comments_approved_idx" ON "public"."Comments"("approved");

-- CreateIndex
CREATE UNIQUE INDEX "SiteStats_key_key" ON "public"."SiteStats"("key");

-- CreateIndex
CREATE INDEX "SiteStats_key_idx" ON "public"."SiteStats"("key");

-- AddForeignKey
ALTER TABLE "public"."Articles" ADD CONSTRAINT "Articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Articles" ADD CONSTRAINT "Articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleTags" ADD CONSTRAINT "ArticleTags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArticleTags" ADD CONSTRAINT "ArticleTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Projects" ADD CONSTRAINT "Projects_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectTechnologies" ADD CONSTRAINT "ProjectTechnologies_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectTechnologies" ADD CONSTRAINT "ProjectTechnologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "public"."Technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comments" ADD CONSTRAINT "Comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comments" ADD CONSTRAINT "Comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."Articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
