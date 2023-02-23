require('dotenv').config()
const Shopify = require('shopify-api-node')
const _cliProgress = require('cli-progress')

// console.log(process.env);
const shopify = new Shopify({
    shopName: process.env.SHOP_NAME,
    accessToken: process.env.ACCESS_TOKEN,
})

const target_status = 'active';

const main = async () => {
    const mbar = new _cliProgress.MultiBar({}, _cliProgress.Presets.shades_classic)
    try {
        while (true) {
            let progress = 0
            const books = await shopify.product.list({limit: 250, status: target_status})
            if (books.length <= 0) break;
            // console.log(`Updating ${books.length} products!`)
            const bar = mbar.create(books.length, progress, '')
            bar.start(books.length, progress)
            for (let i = 0; i < books.length; i++) {
                try {
                    const book = books[i]
                    await shopify.product.update(book.id, {status: 'draft'})
                } catch (e) {
                    console.log(`${book.category}-${book.title}  Failed to update product status. ${e.toString().slice(0, 200)}`)
                }
                bar.update(progress += 1)
            }
            bar.stop()
        }
    } catch (e) {
        console.log(` Something wrong: ${e.toString()}`);
    }
}

main().then(() => {
    console.log("Done!");
}).catch((e) => {
    console.log(e)
}).finally(async () => {
    process.exit(0)
})