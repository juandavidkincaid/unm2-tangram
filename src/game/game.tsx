import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';
import { EventEmitter } from 'events';


import {
    NC,
    Title
} from '@tangram-util';
import {
    ViewportStyle,
    useViewport
} from '@tangram-styling';
import { theme, app } from '@tangram-core';

import {
    Tangram
} from './controller';

const TangramGameViewLayout = styled.div`
    display: grid;
    width: 100%;
    height: 100%;

    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr min-content;
    grid-template-areas:
        "header"
        "content"
        "footer";
    grid-auto-rows: min-content;

    background-color: ${theme.c.e};

    main{
        display: grid;
        width: 100%;

        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        column-gap: 20px;

        grid-area: content;
        padding: 20px;

        .canvas-holder{
            display: flex;
            width: 100%;
            height: 100%;

            place-content: center;
            background-color: ${theme.c.a};


            canvas{
                width: max(362px, 100%);
                height: max(450px, 100%);
            }    
        }

        
    }

    .mobile{
        display: none;
        grid-area: content;
        width: 100%;
        height: 100%;
        place-content: center;
        place-items: center;

        color: ${theme.c.a};
        font-size: 2em;
        text-align: center;
    }

    ${ViewportStyle('MobileTablet')}{
        main{
            display: none;
        }

        .mobile{
            display: flex;
        }
    }

    header{
        display: flex;
        width: 100%;
        height: 100%;

        grid-area: header;

        place-content: center;
        place-items: center;

        padding: 10px;
        color: ${theme.c.e};
        font-size: 2em;
        font-family: ${theme.fTitle};
    }

    footer{
        display: flex;
        width: 100%;
        height: 100%;

        grid-area: footer;

        place-content: center;
        place-items: center;
        padding: 10px;
        color: ${theme.c.e};

        a{
            text-decoration: none;
            color: inherit;
        }
    }

    header, footer, .canvas-holder{
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s;
        background-color: ${theme.c.a};

        &:hover{
            box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
        }
    }
`;

const TangramGameView = NC('TangramGameView', ({ children }) => {
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const vp = useViewport();
    const store = useMemo<{
        tangram: null | Tangram
    }>(() => ({
        tangram: null
    }), []);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                store.tangram = new Tangram(ctx, canvas, process.env.NODE_ENV === 'development');
                store.tangram.startGame();
            }
        }
    }, []);

    useEffect(()=>{
        if(canvasRef.current && store.tangram){
            const canvas = canvasRef.current;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            store.tangram.settleSize();
        }
    }, [vp]);

    return <TangramGameViewLayout>
        <header>
            The Tangram Game
        </header>
        <footer>
            <span>
                By <a href="https://github.com/juandavidkincaid">@juandavidkincaid</a>, for <a href="https://unal.edu.co/">UNAL</a>
            </span>
        </footer>
        <main>
            <div className='canvas-holder'>
                <canvas ref={canvasRef} />
            </div>
            <div className='controls'>
                <button>
                    
                </button>
            </div>
        </main>
        <div className='mobile'>
            This is a desktop game, not visible on mobile screens
        </div>
    </TangramGameViewLayout>;
});

export {
    TangramGameView
}
