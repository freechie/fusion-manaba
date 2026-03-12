-- CreateTable
CREATE TABLE "store_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,

    CONSTRAINT "store_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_product" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "store_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_category_slug_key" ON "store_category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "store_product_slug_key" ON "store_product"("slug");

-- AddForeignKey
ALTER TABLE "store_product" ADD CONSTRAINT "store_product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "store_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
