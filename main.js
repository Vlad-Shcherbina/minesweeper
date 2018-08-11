const W = 9;
const H = 9;
const NUM_MINES = 10;
function generateEmptyField(w, h) {
    return [...Array.from({ length: H }, () => [...Array.from({ length: W }, () => ({ value: 0, vis: 'unknown' }))])];
}
function placeMines(field, numMines, forbiddenI, forbiddenJ) {
    let h = field.length;
    let w = field[0].length;
    for (let k = 0; k < numMines; k++) {
        while (true) {
            let i = Math.floor(Math.random() * h);
            let j = Math.floor(Math.random() * w);
            if (i == forbiddenI && j == forbiddenJ) {
                continue;
            }
            if (field[i][j].value == 'mine') {
                continue;
            }
            field[i][j].value = 'mine';
            break;
        }
    }
    field.forEach((row, i) => row.forEach((cell, j) => {
        if (cell.value == 'mine') {
            return;
        }
        let cnt = 0;
        for (let i1 = Math.max(0, i - 1); i1 < h && i1 <= i + 1; i1++) {
            for (let j1 = Math.max(0, j - 1); j1 < w && j1 <= j + 1; j1++) {
                if (field[i1][j1].value == 'mine') {
                    cnt++;
                }
            }
        }
        cell.value = cnt;
    }));
}
function gameStatus(field) {
    let hasRevealed = false;
    let exploded = false;
    let hasUncertainty = false;
    for (let row of field) {
        for (let cell of row) {
            if (cell.vis == 'revealed') {
                hasRevealed = true;
                if (cell.value == 'mine') {
                    exploded = true;
                }
            }
            if (cell.vis != 'revealed' && cell.value != 'mine') {
                hasUncertainty = true;
            }
        }
    }
    if (!hasRevealed) {
        return 'new';
    }
    if (exploded) {
        return 'lost';
    }
    if (hasUncertainty) {
        return 'playing';
    }
    return 'won';
}
function reveal(field, i, j) {
    let h = field.length;
    let w = field[0].length;
    let queue = [[i, j]];
    while (queue.length > 0) {
        let [i, j] = queue.pop();
        field[i][j].vis = 'revealed';
        if (field[i][j].value == 0) {
            for (let i1 = Math.max(0, i - 1); i1 < h && i1 <= i + 1; i1++) {
                for (let j1 = Math.max(0, j - 1); j1 < w && j1 <= j + 1; j1++) {
                    if (field[i1][j1].vis == 'unknown') {
                        queue.push([i1, j1]);
                    }
                }
            }
        }
    }
}
class Minefield extends preact.Component {
    constructor() {
        super();
        this.setState({ field: generateEmptyField(W, H) });
    }
    click(i, j, e) {
        let status = gameStatus(this.state.field);
        if (status == 'won' || status == 'lost') {
            return;
        }
        let state = this.state;
        let cell = state.field[i][j];
        if (e.button == 0) {
            if (cell.vis == 'flagged') {
                cell.vis = 'unknown';
            }
            else {
                if (status == 'new') {
                    placeMines(state.field, NUM_MINES, i, j);
                }
                reveal(state.field, i, j);
            }
        }
        else if (e.button == 2) {
            if (cell.vis == 'flagged') {
                cell.vis = 'unknown';
            }
            else if (cell.vis == 'unknown') {
                cell.vis = 'flagged';
            }
        }
        this.setState(state);
        e.preventDefault();
    }
    render() {
        let status = gameStatus(this.state.field);
        let finished = status == 'won' || status == 'lost';
        return preact.h("table", null, this.state.field.map((row, i) => preact.h("tr", null, row.map((cell, j) => renderCell(cell, (e) => this.click(i, j, e), finished)))));
    }
}
function renderCell(state, click, gameFinished) {
    if (state.vis == 'flagged') {
        if (gameFinished && state.value == 'mine') {
            return preact.h("td", { class: 'flat guessed' }, "\u26AB");
        }
        return preact.h("td", { onClick: click, onContextMenu: click }, "\uD83D\uDEA9");
    }
    else if (state.vis == 'revealed') {
        if (state.value == 'mine') {
            return preact.h("td", { class: 'flat exploded' }, "\u26AB");
        }
        else {
            return preact.h("td", { class: 'flat content-' + state.value }, state.value || '');
        }
    }
    else if (state.vis == 'unknown') {
        if (gameFinished && state.value == 'mine') {
            return preact.h("td", { class: 'flat ' }, "\u26AB");
        }
        return preact.h("td", { onClick: click, onContextMenu: click });
    }
    else {
        console.assert(false, state.vis);
    }
}
function dummyClick() {
    return;
}
let Main = () => preact.h("div", null,
    preact.h(Minefield, null),
    window.location.hash != '#dev' ? null :
        preact.h("div", null,
            preact.h("hr", null),
            "Visuals:",
            preact.h("table", null,
                preact.h("tr", null,
                    renderCell({ value: 1, vis: 'revealed' }, dummyClick, false),
                    renderCell({ value: 'mine', vis: 'flagged' }, dummyClick, false),
                    renderCell({ value: 'mine', vis: 'unknown' }, dummyClick, false)),
                preact.h("tr", null,
                    renderCell({ value: 'mine', vis: 'revealed' }, dummyClick, true),
                    renderCell({ value: 'mine', vis: 'flagged' }, dummyClick, true),
                    renderCell({ value: 'mine', vis: 'unknown' }, dummyClick, true)),
                [...Array(3)].map((_, i) => preact.h("tr", null, [...Array(3)].map((_, j) => renderCell({ value: 3 * i + j, vis: 'revealed' }, dummyClick, false)))))));
window.onload = () => {
    preact.render(preact.h(Main, null), document.body);
};
//# sourceMappingURL=main.js.map