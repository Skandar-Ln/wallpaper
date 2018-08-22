const request = require('request');
const fs = require('fs');

const constants = {
    catMap: {
        'game': 'game',
        'anime': 'anime',
    },
    counts: {
        'game': 7,
        'anime': 7,
    },
    pageRange: 210,
    pageNum: 3,
    counts1: 24,
    listReg: 'class="pr"(?:.|\n)+?href="(.+?)"',
    detailReg: 'class="thumbnail(?:.|\n)+?src="(.+?)"',
    prefix: 'https://kabekin.com',
    prefix1: 'https://kabekin.com/resolution/1920/1080',
    headers: {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    },
    resolution: '1920/1080'
}

function getOnePageItems(page) {
    const {prefix1, listReg, counts1, resolution} = constants;
    const url = `${prefix1}${page}`; // 此处会自定义
    console.log(`url${url}`)
    return new Promise((resolve, reject) => {
  
        request(url, (e, r, b) => {
            const reg = new RegExp(listReg, 'ig');
            const result = [];
            for (let i = 0; i < counts1; i++) {
                const res = reg.exec(b);
                const pageName = page.replace(/\?/g,'');
                console.log(`匹配${i}${res[1]}`)
                const pageName = page.replace(/\?/g,'');
                if(res) {
                    console.log(`匹配${i}${res[1]}`)
                    result.push({
                        url: `${res[1]}/${resolution}`,
                        name: `${pageName}_${i + 1}.jpg`
                    });
                }
            }
            resolve(result);
        });
    });
}

function getDetails(items) {
    const {detailReg, prefix} = constants;

    return new Promise(async (resolve, reject) => {
        const result = [];
        const promiseArr = [];
        for (let item of items) {
            let promise = new Promise((resolve, reject) => {
                request(item.url, (e, r, b) => {
                    const reg = new RegExp(detailReg, 'ig');
                    const res = reg.exec(b);
                    if(res) {
                        console.log('getDetail',res[1])
                        result.push({
                            url: `${prefix}${res[1]}`,
                            name: item.name
                        });
                    }
                    resolve();
                });
            request(item.url, (e, r, b) => {
                const reg = new RegExp(detailReg, 'ig');
                const res = reg.exec(b);

                if(res) {
                    result.push({
                        url: `${prefix}${res[1]}`,
                        name: item.name
                    });
                }

                if (result.length === items.length) {
                    resolve(result);
                }
            });
            promiseArr.push(promise);
        }
        Promise.all(promiseArr).then(() => resolve(result));
    });
}

function dowloadItem(item) {
    console.log('download: ' + item.url);
    return new Promise((resolve, reject) => {
        let stream = fs.createWriteStream('walls/' + item.name);
        request(item.url).pipe(stream).on('close', () => {
            console.log(item.name + ' completed!');
            resolve();
        });
    });
}


async function main() {
    const {pageNum, pageRange} =  constants;
    for (let i=0; i < pageNum; i++ ) {
        let num = parseInt(pageRange*Math.random());
        let page = num ? `?page=${num}` : '';
        console.log(`..................page${num}`);

 function main() {
    const {pageNum, pageRange} =  constants;
    let promise = Promise.resolve();
    for (let i=0; i < pageNum; i++ ) {
        let num = parseInt(pageRange*Math.random());
        let page = num ? `?page=${num}` : '';
        console.log(`..................page${num}`);

        promise = promise.then(() => getOnePageItems(page)).then(  items => {
        await getOnePageItems(page).then(async items => {
            return getDetails(items);
        }).then(details => {
            for (let detail of details) {
                dowloadItem(detail);
            }
        });

    }
}

main();
