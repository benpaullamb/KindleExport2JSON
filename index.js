const fs = require('fs');
const cheerio = require('cheerio');

const file = fs.readFileSync('./Notebook.html', 'utf-8');
const $ = cheerio.load(file);

const docHeading = $('.bodyContainer h1');

const output = {
    title: docHeading.find('.bookTitle').text().trim(),
    author: docHeading.find('.authors').text().trim(),
    chapters: []
};

let nextHighlightChapter = getChapter($('.bodyContainer'));
let nextHighlightSubchapter = getSubchapter($('.bodyContainer'));

$('.noteText').each((i, el) => {
    const note = $(el);
    
    const highlight = {
        highlight: note.text().split('\n')[0],
        chapter: nextHighlightChapter,
        subchapter: nextHighlightSubchapter
    };

    addHighlight(highlight);

    const chapter = getChapter(note);
    if(chapter) nextHighlightChapter = chapter;

    nextHighlightSubchapter = getSubchapter(note);
});

fs.writeFileSync(`./${output.title} Highlights.json`, JSON.stringify(output));

function addHighlight(highlight) {
    const subchapter = {
        title: highlight.subchapter,
        highlights: [
            highlight.highlight
        ]
    };

    const oldChapter = output.chapters.find(chapter => chapter.title === highlight.chapter);
    if(oldChapter) {
        const oldSubchapter = oldChapter.subchapters.find(subchapter => subchapter.title === highlight.subchapter);
        if(oldSubchapter) {
            oldSubchapter.highlights.push(highlight.highlight);
        } else {
            oldChapter.subchapters.push(subchapter);
        }

    } else {
        output.chapters.push({
            title: highlight.chapter,
            subchapters: [subchapter]
        });
    }
}

function getChapter(note) {
    let chapter;
    
    const chapterHeading = note.find('h2');
    if(chapterHeading.length >= 1) {
        chapter = chapterHeading.text().split('-')[1];
    }

    return chapter;
}

function getSubchapter(note) {
    const heading = note.find('h3').text();
    const subchapterRegExp = /Highlight \(.+\) - (.+) >/gi;
    const subchapterRegExpRes = subchapterRegExp.exec(heading);

    return subchapterRegExpRes ? subchapterRegExpRes[1] : 'Intro';
}