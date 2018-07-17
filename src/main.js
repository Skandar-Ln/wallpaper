const request = require('request');
const fs = require('fs');

const constants = {
    catMap: {
        'game': 'game',
        'anime': 'anime',
    },
    counts: {
        'game': 15,
        'anime': 15,
    },
    output: 'walls/',
    listReg: 'class="pr"(?:.|\n)+?href="(.+?)"',
    detailReg: 'class="thumbnail(?:.|\n)+?src="(.+?)"',
    prefix: 'https://kabekin.com',
    headers: {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    },
    resolution: '1920/1080'
}

function getOnePageItems(cat) {
    const {prefix, catMap, listReg, counts, resolution} = constants;

    const url = `${prefix}/category/${catMap[cat]}`; // 此处会自定义

    return new Promise((resolve, reject) => {
        request(url, (e, r, b) => {
            const reg = new RegExp(listReg, 'ig');
            const result = [];

            for (let i = 0; i < counts[cat]; i++) {
                const res = reg.exec(b);
                if(res) {
                    result.push({
                        url: `${res[1]}/${resolution}`,
                        name: `${cat}_${i + 1}.jpg`
                    });
                }
            }

            resolve(result);
        });
    });
}

function getDetails(items) {
    const {detailReg, prefix} = constants;

    return new Promise((resolve, reject) => {
        const result = [];
        let errNum = 0;

        for (let item of items) {
            request(item.url, (e, r, b) => {
                if (e) {
                    errNum++;
                    return;
                }

                const reg = new RegExp(detailReg, 'ig');
                const res = reg.exec(b);

                if(res) {
                    result.push({
                        url: `${prefix}${res[1]}`,
                        name: item.name
                    });
                }

                if (result.length === items.length - errNum) {
                    resolve(result);
                }
            });
        }
    });
}

function dowloadItem(item) {
    console.log('download: ' + item.url);
    return new Promise((resolve, reject) => {
        let stream = fs.createWriteStream(constants.output + item.name);
        request(item.url).pipe(stream).on('close', () => {
            console.log(item.name + ' completed!');
            resolve();
        });
    });
}

async function main() {
    for (let cat in constants.counts) {
        console.log(cat + '................: ' + constants.counts[cat]);

        await getOnePageItems(cat).then(async items => {
            return getDetails(items);
        }).then(details => {
            for (let detail of details) {
                dowloadItem(detail);
            }
        });
    }
}

main();
