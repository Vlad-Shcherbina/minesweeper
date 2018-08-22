const W = 9;
const H = 9;
const NUM_MINES = 10;

type CellState = {
    value: 'mine' | number
    vis: 'unknown' | 'revealed' | 'flagged'
}
type MinefieldState = {
    field: CellState[][]
}

function generateEmptyField(w: number, h: number): CellState[][] {
    return [...Array.from({length: H}, () =>
        [...Array.from({length: W}, () =>
            ({value: 0, vis: 'unknown'} as CellState)
    )])];
}

function placeMines(field: CellState[][], numMines: number, forbiddenI: number, forbiddenJ: number) {
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
    field.forEach((row, i) =>
        row.forEach((cell, j) => {
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

function gameStatus(field: CellState[][]): 'new' | 'playing' | 'won' | 'lost' {
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

function reveal(field: CellState[][], i: number, j: number) {
    let h = field.length;
    let w = field[0].length;
    let queue = [[i, j]];
    while (queue.length > 0) {
        let [i, j] = queue.pop()!;
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

class Minefield extends preact.Component<{}, MinefieldState> {
    constructor() {
        super();
        this.setState({field: generateEmptyField(W, H)});
    }

    click(i: number, j: number, e: MouseEvent) {
        let status = gameStatus(this.state.field);
        if (status == 'won' || status == 'lost') {
            return;
        }

        let state = this.state;
        let cell = state.field[i][j];
        if (e.button == 0) {
            if (cell.vis == 'flagged') {
                cell.vis = 'unknown';
            } else {
                if (status == 'new') {
                    placeMines(state.field, NUM_MINES, i, j);
                }
                reveal(state.field, i, j);
            }
        }
        else if (e.button == 2) {
            if (cell.vis == 'flagged') {
                cell.vis = 'unknown';
            } else if (cell.vis == 'unknown') {
                cell.vis = 'flagged';
            }
        }
        this.setState(state);
        e.preventDefault();
    }

    render() {
        let status = gameStatus(this.state.field);
        let finished = status == 'won' || status == 'lost';
        return <table>
            {this.state.field.map((row, i) =>
                <tr>
                    {row.map((cell, j) =>
                        renderCell(cell, (e)=>this.click(i, j, e), finished)
                    )}
                </tr>
            )}
        </table>;
    }
}

const MINE = <span>⚫</span>
const FLAG = <span>🚩</span>

function renderCell(state: CellState, click: (e: MouseEvent) => void, gameFinished: boolean) {
    if (state.vis == 'flagged') {
        if (gameFinished && state.value == 'mine') {
            return <td class='flat guessed'>{MINE}</td>;
        }
        return <td onClick={click} onContextMenu={click}>{FLAG}</td>;
    } else if (state.vis == 'revealed') {
        if (state.value == 'mine') {
            return <td class='flat exploded'>{MINE}</td>;
        } else {
            return <td class={'flat content-' + state.value}>{state.value || ''}</td>;
        }
    } else if (state.vis == 'unknown') {
        if (gameFinished && state.value == 'mine') {
            return <td class='flat '>{MINE}</td>;
        }
        return <td onClick={click} onContextMenu={click}/>;
    } else {
        console.assert(false, state.vis);
    }
}


function dummyClick() {
    return;
}

let Main = () =>
<div>
    <Minefield/>
    {window.location.hash != '#dev' ? null :
    <div>
        <hr/>
        Visuals:
        <table>
        <tr>
            {renderCell({value: 1, vis: 'revealed'}, dummyClick, false)}
            {renderCell({value: 'mine', vis: 'flagged'}, dummyClick, false)}
            {renderCell({value: 'mine', vis: 'unknown'}, dummyClick, false)}
        </tr>
        <tr>
            {renderCell({value: 'mine', vis: 'revealed'}, dummyClick, true)}
            {renderCell({value: 'mine', vis: 'flagged'}, dummyClick, true)}
            {renderCell({value: 'mine', vis: 'unknown'}, dummyClick, true)}
        </tr>
        {[...Array(3)].map((_, i) =>
            <tr>
                {[...Array(3)].map((_, j) =>
                    renderCell({value: 3 * i + j, vis: 'revealed'}, dummyClick, false))}
            </tr>
        )}
        </table>
    </div>
    }
</div>;

window.onload = () => {
    preact.render(<Main/>, document.body);
};
