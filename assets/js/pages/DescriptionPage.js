import React from 'react'
import { examples, schema, download } from '../components/helpers.js'
import Histogram from "../components/Histogram";
import Signal from "../components/Signal";
import axios from "axios";
import d3 from "d3";

const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>
);

class DescriptionPage extends React.Component {
    constructor(props) {
        super(props);
        this.examples = examples();
        this.schema = schema();
        this.state = {'tab': 'Python'};
        // console.log('overview', overview);
    }

    componentDidMount() {
        axios({url: `/api/overview`, method: 'get'}).then((res) => {
            this.setState({'overview': res.data});
        });
    }

    renderOverview()
    {
        let overview = this.state.overview;
        return (
            <>
                <h4 className={'h4'}>Всего сигналов в базе:</h4>
                <div className={'items'}><code>{overview.total.toLocaleString()}</code></div>
                <div className={'dataset-groups'}>
                    {overview['ds_names'].map(ds => {
                        const d = overview['ds'][ds];
                        return (
                            <div className={'dataset-group'} key={ds}>
                                <h4 className={'h4'}>Набор данных: <strong>{ds}</strong></h4>
                                <table>
                                    <thead><tr><th>Тип вариации &rarr;</th>{Object.keys(d.types).map(type => <th key={type}>{type}</th>)}</tr></thead>
                                    <tbody>
                                    {[['Левый', 'L'], ['Правый', 'R'], ['БП', 'BP'], ['Спец.', 'spSV']].map(k =>
                                        <tr key={k}>
                                            <td><span className={`tag side-${k[1]}`}>{k[1]}</span> {k[0]}:</td>
                                            {Object.keys(d.types).map(type => {
                                                let s = 0;
                                                Object.keys(d.types[type]).map(p => {
                                                    if (d.stat[p][type][k[1]]) s += d.stat[p][type][k[1]].count;
                                                })
                                                return <td key={type}>{s}</td>;
                                            })}
                                        </tr>
                                    )}
                                    <tr>
                                        <td><strong>Всего:</strong></td>
                                        {Object.keys(d.types).map(type => {
                                            let s = Object.values(d.types[type]).reduce((a, curr) => a + curr)
                                            return <td key={type}>{s}</td>;
                                        })}
                                    </tr>
                                    </tbody>
                                </table>

                                <table>
                                    <thead><tr><th>Популяция (число образцов)</th>{Object.keys(d.types).map(type => <th key={type}>{type}</th>)}</tr></thead>
                                    <tbody>
                                    {Object.keys(d.populations).map((p_name, r) => (
                                        <tr key={r}>
                                            <td>{p_name} ({d.populations[p_name]})</td>
                                            {Object.keys(d.types).map(type => {
                                                const stat = d.stat[p_name][type];
                                                return (
                                                    <td className={'data'} key={type}>
                                                        <div className={'histogram-wrapper'}>
                                                            <p className={'helper'}>Распределение покрытия:</p>
                                                            <Histogram obj={stat} />
                                                            <div className={'col head'}><span>Тип</span><span>Сред.</span><span>Всего</span></div>
                                                            {Object.keys(stat).map(side => (
                                                                <div className={'col'} key={side}>
                                                                    <span className={`side-${side}`}><b>{side}</b></span>
                                                                    <span>{stat[side].mean.toFixed(2)}</span>
                                                                    <span>{stat[side].count}</span>
                                                                </div>
                                                            ))}
                                                            <div className={'col footer'}><span className={'w66'}>Всего</span><span>{d.types[type][p_name]}</span></div>
                                                        </div>
                                                    </td>
                                                );
                                            })}

                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            </>
        );

    }

    render() {
        return (
            <div>
                <div className={'part'}>
                    <p className="lead">
                        База данных сигналов покрытий содержит данные о покрытии генома вблизи точек разрыва структурных
                        вариантов (таблица <code>signal</code>). Все значения покрытия сохраняются без нормализации
                        и без сжатия. Для каждого сигнала в базе данных указано, какой из точек разрыва структурного
                        варианта использовался: левый (L), правый (R), левый и правый совпадают (BP), специальный тип (svPB).
                        Для каждого сигнала в базе данных хранится информация об образце, из которого он был получен
                        (таблица <code>target</code>). На визуализации точка разрыва расположена ровно по центру
                        (выделен вертикальной красной линией). Горизонтальная синяя линия — это среднее покрытие
                        для образца, из которого был получен сигнал. Источники данных: GIAB образец HG002,
                        трио YRI, CHS и PUR из работы Chaisson et al
                        [Chaisson, Mark J P et al. “Multi-platform discovery of haplotype-resolved structural variation in human genomes.” Nature communications vol. 10,1 1784. 16 Apr. 2019].
                    </p>
                </div>

                <h2 className="h2">
                    <span>Схема</span>
                    <div className={'group'}>
                        <button onClick={() => { download('schema.json', this.schema.documents) }} className={'button'}>{icon} JSON</button>
                        <button onClick={() => { download('schema.sql', this.schema.sqlite, 'application/octet-stream') }} className={'button'}>{icon} SQLite</button>
                    </div>
                </h2>

                <div className={'part tables'}>
                    {this.schema.compact.map((table, k) => (
                        <div key={k} className="col">
                            <h4 className="h4">Таблица: <code>{table.name}</code></h4>
                            <table>
                                <thead><tr><th>Колонка</th><th>Описание</th></tr></thead>
                                <tbody>
                                {table.columns.map((row,r) => (
                                    <tr key={r}>
                                        <td>{row.name} <code>{row.type.datatype}</code></td>
                                        <td>{row.options.comment}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>

                <h2 className="h2">
                    <span>Примеры кода</span>
                    <div className={'group tabs'}>
                        {['Python', 'PHP', 'R'].map(lang => (
                            <button className={`button ${this.state['tab'] === lang ? 'active' : ''}`}
                                    onClick={() => this.setState({'tab': lang})} key={lang}>{lang}</button>
                        ))}
                    </div>
                </h2>
                <div className={'part'}>
                    <h4 className="h4">{this.state['tab']}</h4>
                    <div className={'code'} dangerouslySetInnerHTML={{ __html: this.examples[this.state['tab']] }} />
                </div>

                <h2 className="h2">Статистика</h2>
                <div className={'part stat'}>
                    {(this.state.overview ? this.renderOverview() : 'Loading...')}
                </div>
            </div>
        );
    }
}

export default DescriptionPage;
