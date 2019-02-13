const request = require('request');
const cheerio = require('cheerio');
const urlParser = require('url-parse');
const fs = require('fs');

module.exports = function Crawler(URL, max) {

    let unvisitedLink = [];
    let visitedLink = {};

    let visitedLinkCount = 0;

    let baseUrl = new urlParser(URL);

    unvisitedLink.push(URL);

    const crawler = () => {
        if (visitedLinkCount >= max) {
            return;
        }
        const nextLink = unvisitedLink.pop();

        if (nextLink in visitedLink) {
            crawler();
        }
        else {

            visitedLink[nextLink] = true;

            request(nextLink, (error, response, body) => {
                console.log('\n' + 'Ссылка: ' + nextLink);
                console.log('Ответ: ' + response.statusCode);
                if (response.statusCode !== 200) {
                    console.log('Страница не найдена! Файл не создан');
                    crawler();
                    return;
                }

                visitedLinkCount++;

                const $ = cheerio.load(body),
                    $body = $(body);


                //запись ссылки
                let link = nextLink + '\n';
                fs.appendFile('crawler/resources/index.txt', link, (err, file) => {
                    if (err) throw err;
                });


                //запись текста из ссылки
                let content = $body.text().replace(/\s+/g, ' ');
                fs.appendFile(`${'crawler/resources/pages'}/${visitedLinkCount}.txt`, content, (err, file) => {
                    if (err) throw err;
                    console.log(`Файл: ${visitedLinkCount}.txt`);
                });


                //добавление ссылки в массив
                const relativeLinks = $('a[href^="/"]');
                relativeLinks.each(function () {
                    let url = baseUrl + $(this).attr('href');
                    unvisitedLink.push(url);
                });

                crawler();
            });
        }
    }

    crawler();
}

