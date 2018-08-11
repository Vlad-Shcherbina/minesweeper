type ClockState = { time: number };

class Clock extends preact.Component<{}, ClockState> {
    timer: number

    constructor() {
        super();
        this.state = { time: Date.now() };
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({ time: Date.now() });
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        let time = new Date(this.state.time).toLocaleTimeString();
        return <span>{time}</span>;
    }
}

type CellState = {
    value: 'mine' | number
    vis: 'unknown' | 'revealed' | 'flagged'
}
type MinefieldState = {
    field: CellState[][]
}

class Minefield extends preact.Component<{}, MinefieldState> {
    constructor() {
        super();
        let s = [...Array.from({length: 10}, () =>
            [...Array.from({length: 10}, () =>
                ({value: 0, vis: 'unknown'} as CellState)
        )])];
        s[0][3].vis = 'flagged';
        s[0][4].vis = 'flagged';
        s[0][4].value = 'mine';
        for (let i = 0; i <= 8; i++) {
            s[1 + Math.floor(i / 3)][i % 3].vis = 'revealed';
            s[1 + Math.floor(i / 3)][i % 3].value = i;
        }
        s[2][4].vis = 'revealed';
        s[2][4].value = 'mine';

        s[7][8].value = 'mine';
        this.setState({field: s});
    }
    click(e: MouseEvent) {
        console.log('click', e);
    }
    render() {
        return <table class='minefield'>
            {this.state.field.map((row, i) =>
                <tr>
                    {row.map((cell, j) =>
                        renderCell(cell, true)
                    )}
                </tr>
            )}
        </table>;
    }
}

function renderCell(state: CellState, gameFinished: boolean) {
    if (state.vis == 'flagged') {
        if (gameFinished && state.value == 'mine') {
            return <td class='flagged content-mine'>⚫</td>;
        }
        // TODO: onClick
        return <td>🚩</td>;
    } else if (state.vis == 'revealed') {
        if (state.value == 'mine') {
            return <td class='revealed content-mine'>⚫</td>;
        } else {
            return <td class={'revealed content-' + state.value}>{state.value || ''}</td>;
        }
    } else if (state.vis == 'unknown') {
        if (gameFinished && state.value == 'mine') {
            return <td class='content-mine'>⚫</td>;
        }
        // TODO: onClick
        return <td/>;
    } else {
        console.assert(state.vis);
    }
}


let Main = () =>
<div>
    <Clock/>
    <hr/>
    <Minefield/>
</div>;

window.onload = () => {
    preact.render(<Main/>, document.body);
};
