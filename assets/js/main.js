import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, NavLink, Route, Switch} from 'react-router-dom'
// import TagManager from 'react-gtm-module'

import sizes from "../scss/main.scss";
import 'highlight.js/scss/github.scss'
window.sizes = sizes;

import PlotPage from './pages/PlotPage';
import DescriptionPage from './pages/DescriptionPage';

// TagManager.initialize({ gtmId: 'G-...' });

const ErrorPage = () => <div className={'error-page'}>Не найдено</div>;

ReactDOM.render(
    <Router>
        <div className={'header-wrapper'}>
            <div className={'container'}>
                <header className={'header'}>
                    <h1 className="h1">
                        <NavLink to={`/`}><strong>SCOPE</strong>&nbsp;–&nbsp;Sequence COverage ProfilEs</NavLink>
                        <svg xmlns="http://www.w3.org/2000/svg" width="90" height="20" role="img" aria-label="Version: 0.0.1"><title>Version: 0.0.1</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="90" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="51" height="20" fill="#555"/><rect x="51" width="39" height="20" fill="#97ca00"/><rect width="90" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="265" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="410">Version</text><text x="265" y="140" transform="scale(.1)" fill="#fff" textLength="410">Version</text><text aria-hidden="true" x="695" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="290">0.0.1</text><text x="695" y="140" transform="scale(.1)" fill="#fff" textLength="290">0.0.1</text></g></svg>
                    </h1>
                    <nav className={'nav'}>
                        <NavLink className={'link'} exact activeClassName={'active'} to={`/`}>
                            <span>Обзор</span>
                        </NavLink>
                        <NavLink className={'link'} activeClassName={'active'} to={`/description`}>
                            <span>Описание</span>
                        </NavLink>
                    </nav>
                </header>
            </div>
        </div>
        <section className={'container content'}>
          <Switch>
            <Route exact path="/" component={PlotPage} />
            <Route path="/description" component={DescriptionPage} />
            <Route path="*" component={ErrorPage} />
          </Switch>
        </section>
        <footer className={'container'}>
            <div className={'bottom'}>2020–2022г.</div>
        </footer>
    </Router>,
    document.getElementById('app')
);

if (module.hot) module.hot.accept();
