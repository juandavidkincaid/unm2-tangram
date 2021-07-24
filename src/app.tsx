import React from 'react';
import ReactDOM from 'react-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { createGlobalStyle } from 'styled-components';

import { app, AppTheme, theme } from '@tangram-core';
import { ViewportStyle } from '@tangram-styling'
import { NC } from '@tangram-util';

import { TangramGameView } from '@tangram-game';

const GlobalStyle = createGlobalStyle`
    *{
        box-sizing: border-box;
    }
    
    html, body, #App{
        width: 100%;
        height: 100%;
        margin: 0;
        display: grid;
        place-content: start;
        place-items: start;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        font-family: ${theme.fFamily};
        font-size: calc(${theme.fSize} * 1);
        ${ViewportStyle('MobileExtended')}{
            font-size: calc(${theme.fSize} * 0.95);
        }
        line-height: 1;
        background-color: ${theme.c.wh};
    }
`;

const App = NC<{}>('App', ({ }) => {
    app.useAppData();

    return <TangramGameView/>;
});


ReactDOM.render(<React.StrictMode>
    <HelmetProvider>
        <Helmet>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Zen+Tokyo+Zoo&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Teko&display=swap" rel="stylesheet"/>
        </Helmet>
        <AppTheme.Provider>
            <GlobalStyle />
            <App />
        </AppTheme.Provider>
    </HelmetProvider>
</React.StrictMode>, document.getElementById('App'))
