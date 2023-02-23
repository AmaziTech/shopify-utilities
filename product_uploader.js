require('dotenv').config()
const Shopify = require('shopify-api-node')
const image2base64 = require('image-to-base64')
const _cliProgress = require('cli-progress')

// console.log(process.env);
const shopify = new Shopify({
    shopName: process.env.SHOP_NAME,
    accessToken: process.env.ACCESS_TOKEN,
})

const target_status = 1; //not uploaded yet
const {PrismaClient} = require('@prisma/client');

const main = async () => {
    const bar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic)
    let progress = 0
    let prisma = null;
    try {
        prisma = new PrismaClient();
        let books = await prisma.book.findMany({
            select: {
                title: true,
                author: true,
                status: true,
                category: true,
                cover_url: true,
                kind: true,
                description: true,
                publisher: true
            },
            where: {status: target_status}
        });
        if (books.length === 0) throw ('No book record found!. Ignored!.')
        console.log(`Uploading ${books.length} products!`)
        bar.start(books.length, progress)
        for (let i = 0; i < books.length; i++) {
            // if (progress > 10) throw (`Let's try with 10 products.`)
            const book = books[i];
            try {
                //get book cover image fron cdn then convert to base64 format
                const base64Code = await image2base64(book.cover_url)
                const images = [{
                    attachment: base64Code,
                }]

                const productDetails = {
                    product_type: 'Book',
                    product_category: 'Books',
                    vendor: book.author,
                    variants: [
                        {
                            price: 350
                        }
                    ],
                    metafields: [{
                        namespace: 'custom',
                        valueType: 'single_line_text',
                        key: 'author',
                        value: book.author,
                        name: 'author'
                    },
                        {
                            namespace: 'custom',
                            valueType: 'single_line_text',
                            key: 'category',
                            value: book.category,
                            name: 'category'
                        },
                        {
                            namespace: 'custom',
                            valueType: 'single_line_text',
                            key: 'kind',
                            value: book.kind,
                            name: 'kind'
                        },
                        {
                            namespace: 'custom',
                            valueType: 'single_line_text',
                            key: 'publisher',
                            value: publisher,
                            name: 'publisher'
                        }]
                }
                await shopify.product.create({
                    ...productDetails,
                    title: book.title,
                    body_html: book.description,
                    images: images,
                })
                // update downloaded status
                await prisma.book.update({
                    data: {
                        status: 9 // uploaded to shopify
                    },
                    where: {
                        title_author: {
                            title: book.title,
                            author: book.author,
                        }
                    }
                });
            } catch (e) {
                console.log(`${book.category}-${book.title} Upload failed. ${e.toString().slice(0, 200)}`)
                await prisma.book.update({
                    data: {
                        status: 10 // failed uploaded to shopify
                    },
                    where: {
                        title_author: {
                            title: book.title,
                            author: book.author,
                        }
                    }
                });
            }
            bar.update(progress += 1)
        }
    } catch (e) {
        console.log(` Something wrong: ${e.toString()}`);
    } finally {
        if (prisma != null) await prisma.$disconnect()
        bar.stop()
    }

}

main().then(() => {
    console.log("Done!");
}).catch((e) => {
    console.log(e)
}).finally(async () => {
    process.exit(0)
})